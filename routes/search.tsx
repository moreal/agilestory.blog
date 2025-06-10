import { Handlers, PageProps } from "$fresh/server.ts";
import { SearchResultItem, SearchResultPost } from "@/components/SearchResultItem.tsx";
import { extractSnippet } from "@/services/snippet.ts";

import { Index } from "flexsearch";
import data from "@/data.json" with { type: "json" };

interface Data {
  result: {
    status: "no-query";
  } | {
    status: "ok";
    keyword: string;
    posts: SearchResultPost[];
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

          // Extract snippet from title and body combined, prioritizing title matches
          const titleText = post.title;
          const bodyText = post.body;
          let snippet = "";
          
          // First try to find the keyword in the title
          if (titleText.toLowerCase().includes(q.toLowerCase())) {
            snippet = extractSnippet(titleText, q, 100);
          }
          
          // If no title match or title snippet is too short, try body
          if (!snippet || snippet.length < 20) {
            const bodySnippet = extractSnippet(bodyText, q);
            if (bodySnippet) {
              snippet = bodySnippet;
            }
          }

          return {
            id: post.id,
            title: post.title,
            createdAt: new Date(post.createdAt),
            snippet,
          };
        }).filter((post) => post !== null) as SearchResultPost[],
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
            {result.posts.map((post) => (
              <SearchResultItem key={post.title} post={post} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
