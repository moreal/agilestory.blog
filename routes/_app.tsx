import { type PageProps } from "$fresh/server.ts";
import * as constants from "@/constants.ts";

export default function App({ Component, state }: PageProps) {
  const titleSuffix = state.subtitle ? ` - ${state.subtitle}` : "";
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{constants.TITLE}{titleSuffix}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="flex flex-col h-screen justify-between gap-8">
        <header>
          <div class="bg-yellow-200 text-black p-2 text-center">
            <p>{constants.WARNING_MESSAGE}</p>
          </div>

          {!titleSuffix && (
            <div class="flex flex-col items-center justify-center mt-8 gap-8">
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
          )}
        </header>
        <Component />
        <footer class="flex flex-col items-center justify-center mt-auto w-full">
          <div class="text-sm text-gray-500 text-center w-full mb-8">
            <p>
              본 사이트의 소스코드는 AGPL-3.0에 따라 공개되어 있습니다.{" "}
              <a href={constants.GITHUB_URL} class="underline">GitHub</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
