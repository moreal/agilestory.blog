import { Handlers, PageProps } from "$fresh/server.ts";
import { YmdDate } from "@/components/YmdDate.tsx";

import { Index } from "flexsearch";
import data from "@/data.json" with { type: "json" };

/**
 * Extract a snippet from text around the first occurrence of the keyword
 * @param text The full text to search in
 * @param keyword The keyword to find
 * @param maxLength Maximum length of the snippet (default: 150)
 * @returns A snippet with the keyword highlighted, or empty string if not found
 */
function extractSnippet(text: string, keyword: string, maxLength = 150): string {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  
  const index = lowerText.indexOf(lowerKeyword);
  if (index === -1) {
    return "";
  }
  
  // Calculate start and end positions for the snippet
  const halfLength = Math.floor((maxLength - keyword.length) / 2);
  const start = Math.max(0, index - halfLength);
  const end = Math.min(text.length, index + keyword.length + halfLength);
  
  let snippet = text.substring(start, end);
  
  // Add ellipsis if we're not at the beginning/end
  if (start > 0) {
    snippet = "..." + snippet;
  }
  if (end < text.length) {
    snippet = snippet + "...";
  }
  
  // Highlight the keyword (case-insensitive)
  const regex = new RegExp(`(${keyword})`, 'gi');
  snippet = snippet.replace(regex, '<strong>$1</strong>');
  
  return snippet;
}

interface Post {
  id: number;
  title: string;
  createdAt: Date;
  snippet?: string;
}

interface Data {
  result: {
    status: "no-query";
  } | {
    status: "ok";
    keyword: string;
    posts: Post[];
  };
}

const index = new Index({
  preset: "memory",
  tokenize: "full",
  resolution: 5,
  encoder: "Exact",
});

for (const { id, title, body } of data) {
  index.add(id, title + "\n\n" + body);
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const requestUrl = new URL(ctx.url);
    const q = requestUrl.searchParams.get("q");

    if (!q) {
      return ctx.render({
        result: { status: "no-query" },
      });
    }

    const result = await index.search(q, { limit: 10 });
    if (!Array.isArray(result)) {
      return ctx.render({
        result: {
          status: "ok",
          keyword: q,
          posts: [],
        },
      });
    }

    return ctx.render({
      result: {
        status: "ok",
        keyword: q,
        posts: result.map((id) => {
          const post = data.find((post) => post.id === id);
          if (!post) {
            throw new Error("Post not found");
          }

          if (!post.createdAt) {
            return null;
          }

          // Extract snippet from title and body combined
          const fullText = post.title + "\n\n" + post.body;
          const snippet = extractSnippet(fullText, q);

          return {
            id: post.id,
            title: post.title,
            createdAt: new Date(post.createdAt),
            snippet,
          };
        }).filter((post) => post !== null) as Post[],
      },
    });
  },
};

export default function (props: PageProps<Data>) {
  const result = props.data.result;

  if (result.status === "no-query") {
    return (
      <div class="px-auto py-8 mx-auto">
        <div class="max-w-screen-sm mx-auto flex flex-col items-center justify-center">
          <span class="text-xs">검색어가 없습니다. 검색어를 입력해주세요.</span>
        </div>
      </div>
    );
  }

  const keyword = result.keyword;
  return (
    <div>
      <div class="px-4">
        <div class="max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
          <h1 class="text-sm w-full text-left font-light">
            "<span class="font-semibold">{keyword}</span>"의 검색 결과
          </h1>
          <ol class="w-full list-none m-0 p-0 flex flex-col gap-1">
            {result.posts.map(({ title, createdAt, id, snippet }) => (
              <li class="w-full list-none" key={title}>
                <a class="flex flex-col gap-2 p-3 hover:bg-gray-50 rounded-md" href={`${id}`}>
                  <div class="flex flex-row gap-4 items-start">
                    <YmdDate
                      date={createdAt!}
                      class="font-light w-24 text-gray-400 text-xs"
                    />
                    <span class="border-b-2 font-medium">{title}</span>
                  </div>
                  {snippet && (
                    <div class="text-sm text-gray-600 ml-28">
                      <span dangerouslySetInnerHTML={{ __html: snippet }} />
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
