import { Handlers, PageProps } from "$fresh/server.ts";
import { YmdDate } from "../components/YmdDate.tsx";
import posts from "../../data.json" with { type: "json" };

interface Data {
  posts: {
    id: number;
    title: string;
    createdAt: Date;
  }[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    return ctx.render({
      posts: posts.filter((post) => post.createdAt !== null).map((post) => {
        const createdAt = new Date(post.createdAt);
        return {
          ...post,
          createdAt,
        };
      }),
    });
  },
};

export default function ({ data: { posts } }: PageProps<Data>) {
  return (
    <div class="px-4 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center gap-16">
        <div class="flex flex-col gap-2 items-center justify-center">
          {posts.map(({ title, createdAt, id }, index) => (
            <li class="w-full list-none" key={index}>
              <a
                class="flex flex-row w-full gap-4"
                href={`/${id}`}
              >
                <YmdDate
                  date={createdAt!}
                  class="font-light w-24 flex-shrink-0 text-gray-400 font-md"
                />
                <span class="border-b-2 text-left">
                  {title}
                </span>
              </a>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}
