import { Head } from "$fresh/runtime.ts";

export default function () {
  return (
    <>
      <Head>
        <title>404 - 없는 페이지 입니다.</title>
      </Head>
      <div class="flex flex-col items-center justify-center gap-4">
        <h1 class="text-xl font-extralight">
          해당 경로에 존재하는 페이지가 없습니다.
        </h1>
        <span>
          <a href="/" class="underline underline-offset-2 font-medium">
            목록으로 가시거나
          </a>{" "}
          위 검색창에 검색어를 입력해보세요.
        </span>
      </div>
    </>
  );
}
