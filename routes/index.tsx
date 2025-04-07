import { Handlers, PageProps } from "$fresh/server.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import { isNotNull } from "drizzle-orm";

interface Data {
  posts: {
    id: number;
    title: string;
    createdAt: Date | null;
  }[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const posts = await db.select({
      id: postsTable.id,
      title: postsTable.title,
      createdAt: postsTable.createdAt,
    }).from(postsTable).where(isNotNull(postsTable.createdAt)).orderBy(
      postsTable.createdAt,
    );

    return ctx.render({
      posts: posts,
    });
  },
};

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${
    String(date.getMonth() + 1).padStart(2, "0")
  }-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Home({ data: { posts } }: PageProps<Data>) {
  return (
    <div class="px-auto mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center gap-16">
        <div class="flex flex-col gap-2 items-center justify-center">
          {posts.map(({ title, createdAt, id }, index) => (
            <li class="w-full list-none" key={index}>
              <a
                class="flex flex-row w-full gap-4"
                href={`/${id}`}
              >
                <span class="font-light w-24 text-gray-400 font-md">
                  {formatDate(createdAt!)}
                </span>
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
