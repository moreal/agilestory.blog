import { Handlers, LayoutConfig, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { FloatingButton } from "@/islands/FloatingButton.tsx";
import { PostNavigation } from "@/components/PostNavigation.tsx";
import posts from "@/data.json" with { type: "json" };

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

    // FIXME: need to precompute.
    const filtered = posts.filter((post) => post.createdAt !== null);
    for (let i = 0; i < filtered.length; i++) {
      const post = filtered[i];
      if (post.id === id) {
        const { title, body, createdAt, internetArchiveUrl } = post;

        const regex =
          /(href|src)="https:\/\/web\.archive\.org\/web\/[^\/]+\/(http[^"]+)"/g;
        const sanitizedBody = body.replaceAll(/<hr>/g, '<hr class="my-4">')
          .replace(
            regex,
            (match: string, attribute: string, url: string) => {
              const SELF = "http://agile.egloos.com";
              const ALLOWED_PREFIXES = [
                "http://www.yes24.com",
                "http://www.youtube.com",
              ] as const;

              if (url.startsWith(SELF)) {
                const newUrl = url.replace(SELF, "");
                return `${attribute}="${newUrl}"`;
              }

              for (const prefix of ALLOWED_PREFIXES) {
                if (url.startsWith(prefix)) {
                  return `${attribute}="${url}"`;
                }
              }

              return match;
            },
          );

        const prevPost = i == 0 ? null : filtered[i - 1];
        const nextPost = i == filtered.length - 1 ? null : filtered[i + 1];

        const returnValue: Data = {
          post: {
            title,
            body: sanitizedBody,
            createdAt: createdAt ? new Date(createdAt) : null,
            internetArchiveUrl,
          },
          prevPost: prevPost
            ? {
              title: prevPost.title,
              createdAt: new Date(prevPost.createdAt),
              id: prevPost.id,
            }
            : null,
          nextPost: nextPost
            ? {
              title: nextPost.title,
              createdAt: new Date(nextPost.createdAt),
              id: nextPost.id,
            }
            : null,
        };

        return ctx.render(returnValue);
      }
    }

    return ctx.renderNotFound();
  },
};

export const config: LayoutConfig = {
  skipInheritedLayouts: true,
};

export default function (props: PageProps<Data>) {
  const { createdAt, title, body, internetArchiveUrl } = props.data.post;

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
            <div class="flex flex-row items-center justify-center w-full gap-1">
              {createdAt && (
                <span class="text-xs">
                  {createdAt.toLocaleString()}
                </span>
              )}
              <span>
                |
              </span>
              <span class="text-xs">
                <a href={internetArchiveUrl}>Internet Archive에서 보기</a>
              </span>
            </div>
            <hr class="w-full mt-6" />
          </div>
        </header>
        <div
          class="leading-[1.6] post-content"
          dangerouslySetInnerHTML={{ __html: body }}
        >
        </div>
        <hr class="w-full" />
        <footer class="w-full">
          <PostNavigation
            prevPost={props.data.prevPost}
            nextPost={props.data.nextPost}
          />
        </footer>
        <FloatingButton />
      </div>
    </>
  );
}
