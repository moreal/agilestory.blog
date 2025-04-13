import { Handlers, LayoutConfig, PageProps } from "$fresh/server.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import { and, asc, desc, eq, gt, isNotNull, lt } from "drizzle-orm";
import { Head } from "$fresh/runtime.ts";
import * as constants from "../constants.ts";

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

export default function (props: PageProps<Data>) {
  const { createdAt, title, body, internetArchiveUrl } = props.data.post;

  const sanitizedBody = body.replaceAll(/<hr>/g, '<hr class="my-4">');

  const regex =
    /(href|src)="https:\/\/web\.archive\.org\/web\/[^\/]+\/(http[^"]+)"/g;
  const sanitizedBodyWithLinks = sanitizedBody.replace(
    regex,
    (match: string, attribute: string, path: string) => {
      const SELF = "http://agile.egloos.com";
      const ALLOWED_PREFIXES = [
        "http://www.yes24.com",
        "http://www.youtube.com",
      ] as const;

      if (path.startsWith(SELF)) {
        const newUrl = path.replace(SELF, "/");
        return `${attribute}="${newUrl}"`;
      }

      for (const prefix of ALLOWED_PREFIXES) {
        if (path.startsWith(prefix)) {
          return `${attribute}="${path}"`;
        }
      }

      return match;
    },
  );

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div class="max-w-screen-sm mx-auto flex flex-col items-center justify-center gap-8 px-4">
        <header class="w-full max-w-full flex flex-col items-center justify-center gap-8">
          <nav class="w-full">
            <a class="left w-full max-w-xl text-sm font-semibold" href="/">
              {"<"} 목록으로 가기
            </a>
          </nav>
          <div class="w-full max-x-xl flex flex-col px-8 items-center justify-center gap-2">
            <h1 class="text-2xl font-bold break-keep text-center">
              {title}
            </h1>
            <span class="text-xs">
              {createdAt?.toLocaleString()} |{" "}
              <a href={internetArchiveUrl}>Internet Archive에서 보기</a>
            </span>
            <hr class="w-full mt-6" />
          </div>
        </header>
        <div
          class="leading-[1.6] post-content"
          dangerouslySetInnerHTML={{ __html: sanitizedBodyWithLinks }}
        >
        </div>
        <hr class="w-full" />
        <footer class="w-full">
          <nav class="w-full">
            <ul class="flex flex-col justify-between w-full gap-4">
              {props.data.prevPost && (
                <li class="w-full text-sm font-semibold text-left">
                  <a
                    href={`/${props.data.prevPost.id}`}
                  >
                    <p>{"<"} {constants.PREVIOUS_POST_MESSAGE}</p>
                    <p class="text-gray-600">{props.data.prevPost.title}</p>
                  </a>
                </li>
              )}
              {props.data.nextPost && (
                <li class="w-full text-sm font-semibold text-right">
                  <a
                    href={`/${props.data.nextPost.id}`}
                  >
                    <p>{constants.NEXT_POST_MESSAGE} {">"}</p>
                    <p class="text-gray-600">{props.data.nextPost.title}</p>
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
