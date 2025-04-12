import { Handlers, LayoutConfig, PageProps } from "$fresh/server.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import { and, asc, desc, eq, gt, isNotNull, lt } from "drizzle-orm";
import { Head } from "$fresh/runtime.ts";

interface Data {
  post: {
    title: string;
    body: string;
    createdAt: Date | null;
    internetArchiveUrl: string;
  };
  prevPost: {
    title: string;
    createdAt: Date;
    id: number;
  } | null;
  nextPost: {
    title: string;
    createdAt: Date;
    id: number;
  } | null;
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const { id: rawId } = ctx.params;
    const id = Number(rawId || "0");

    // Fetch current post
    const currentPostResult = await db
      .select({
        title: postsTable.title,
        createdAt: postsTable.createdAt,
        body: postsTable.body,
        internetArchiveUrl: postsTable.internetArchiveUrl,
      })
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1);

    // NOTE: Ensure lt, gt, desc, asc are imported from "drizzle-orm"
    // import { eq, lt, gt, desc, asc } from "drizzle-orm";

    // Fetch previous post (post with the largest ID smaller than the current one)
    const prevPostResult = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        createdAt: postsTable.createdAt,
      })
      .from(postsTable)
      .where(and(lt(postsTable.id, id), isNotNull(postsTable.createdAt)))
      .orderBy(desc(postsTable.id))
      .limit(1);

    // Fetch next post (post with the smallest ID larger than the current one)
    const nextPostResult = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        createdAt: postsTable.createdAt,
      })
      .from(postsTable)
      .where(and(gt(postsTable.id, id), isNotNull(postsTable.createdAt)))
      .orderBy(asc(postsTable.id))
      .limit(1);

    const result = currentPostResult; // Keep existing check logic
    const prevPost = prevPostResult.length > 0
      ? {
        ...prevPostResult[0],
        createdAt: prevPostResult[0].createdAt!,
      }
      : null;
    const nextPost = nextPostResult.length > 0
      ? {
        ...nextPostResult[0],
        createdAt: nextPostResult[0].createdAt!,
      }
      : null;

    if (result.length === 0) {
      return ctx.renderNotFound();
    }

    return ctx.render({
      post: result[0],
      prevPost,
      nextPost,
    });
  },
};

export const config: LayoutConfig = {
  skipInheritedLayouts: true,
};

export default function Post(props: PageProps<Data>) {
  const { createdAt, title, body, internetArchiveUrl } = props.data.post;

  const sanitizedBody = body.replaceAll(/<hr>/g, '<hr class="my-4">');

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div class="max-w-screen-sm mx-auto flex flex-col items-center justify-center gap-8">
        <header class="px-4 w-full max-w-full flex flex-col items-center justify-center gap-8">
          <nav class="w-full">
            <a class="left w-full max-w-xl text-sm font-semibold" href="/">
              {"<"} 목록으로 가기
            </a>
          </nav>
          <div class="w-full max-x-xl flex flex-col items-center justify-center">
            <h1 class="text-2xl font-bold mb-2">{title}</h1>
            <span class="text-xs">
              {createdAt?.toLocaleString()} |{" "}
              <a href={internetArchiveUrl}>Internet Archive에서 보기</a>
            </span>
            <hr class="w-full mt-6" />
          </div>
        </header>
        <div
          class="leading-[1.6] post-content px-4"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        >
        </div>
        <footer class="w-full px-4">
          <nav class="w-full">
            <ul class="flex flex-col justify-between w-full gap-4">
              {props.data.prevPost && (
                <li class="w-full text-sm font-semibold text-left">
                  <a
                    href={`/${props.data.prevPost.id}`}
                  >
                    {"<"} {props.data.prevPost.title}
                  </a>
                </li>
              )}
              {props.data.nextPost && (
                <li class="w-full text-sm font-semibold text-right">
                  <a
                    href={`/${props.data.nextPost.id}`}
                  >
                    {props.data.nextPost.title} {">"}
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </footer>
      </div>
    </>
  );
}
