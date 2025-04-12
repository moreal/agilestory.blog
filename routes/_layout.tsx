import { PageProps } from "$fresh/server.ts";
import * as constants from "../constants.ts";

export default function Layout({ Component }: PageProps) {
  return (
    <>
      <header>
        <div class="flex flex-col items-center justify-center mt-4 gap-8 p-4">
          <a href="/">
            <h1 class="text-2xl font-bold">{constants.TITLE}</h1>
          </a>
          <form
            action="/search"
            method="GET"
            class="flex flex-row gap-1 w-full max-w-md justify-center items-center"
          >
            <input
              type="text"
              name="q"
              placeholder="검색어를 입력하세요."
              class="border text-sm border-gray-300 rounded-md p-2 basis-md w-full"
            />
          </form>
        </div>
      </header>
      <Component />
    </>
  );
}
