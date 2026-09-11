// @ts-check
import { egloos } from "@agilestory/core"
import { agilestoryWeb } from "@agilestory/web"
import { defineConfig } from "astro/config"

export default defineConfig({
  output: "static",
  site: "https://agilestory.blog",
  integrations: [
    agilestoryWeb({
      title: "애자일 이야기",
      author: "moreal",
      githubUrl: "https://github.com/moreal/agilestory.blog",
      notice:
        "Internet Archive에 아카이빙된 내용을 활용하여 표시하는 서비스입니다. 모든 글의 저작권은 <a href='https://ac2.kr' style='text-underline-offset: 2px; color: #007bff;' class='underline'>원작자</a>에게 있습니다.",
      blog: egloos("agile"),
      allowedLinkPrefixes: ["http://www.yes24.com", "http://www.youtube.com"],
      dataset: "../../data.json",
    }),
  ],
})
