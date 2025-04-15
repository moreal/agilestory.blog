import { Handlers, PageProps } from "$fresh/server.ts";
import { db } from "@/db.ts";
import { searchPosts } from "@/schema.ts";
import { YmdDate } from "@/components/YmdDate.tsx";

interface Data {
  result: {
    status: "no-query";
  } | {
    status: "ok";
    keyword: string;
    posts: {
      id: number;
      title: string;
      createdAt: Date;
      similarity: number;
    }[];
  };
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

    const result = await searchPosts(db, q, 10);

    return ctx.render({
      result: {
        status: "ok",
        keyword: q,
        posts: result,
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
            {result.posts.map(({ title, createdAt, id }) => (
              <li class="w-full list-none" key={title}>
                <a class="flex flex-row gap-4" href={`${id}`}>
                  <YmdDate
                    date={createdAt!}
                    class="font-light w-24 text-gray-400"
                  />
                  <span class="border-b-2">{title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
