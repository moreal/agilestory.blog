import { Handlers, LayoutConfig, PageProps } from "$fresh/server.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import { eq } from "drizzle-orm";
import { Head } from "$fresh/runtime.ts";

interface Data {
  post: {
    title: string;
    body: string;
    createdAt: Date | null;
    internetArchiveUrl: string;
  };
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const { id: rawId } = ctx.params;
    const id = Number(rawId || "0");

    const result = await db.select({
      title: postsTable.title,
      createdAt: postsTable.createdAt,
      body: postsTable.body,
      internetArchiveUrl: postsTable.internetArchiveUrl,
    }).from(postsTable).where(
      eq(postsTable.id, id),
    ).limit(1);

    if (result.length === 0) {
      return ctx.renderNotFound();
    }

    return ctx.render({
      post: result[0],
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
        <header class="px-4 w-full flex flex-col items-center justify-center gap-8">
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
          class="max-w-xl leading-[1.6] post-content px-4"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        >
        </div>
      </div>
    </>
  );
}
