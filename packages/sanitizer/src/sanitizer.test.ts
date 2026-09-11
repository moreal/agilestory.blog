import { RawPost } from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { makeSanitizer, rewriteArchivedLinks } from "./index.ts"

describe("sanitizer", () => {
  it("기본 규칙은 인라인 핸들러와 HTML 주석을 제거해야 합니다.", () => {
    const { sanitize } = makeSanitizer()
    const post = sanitize(
      new RawPost({
        title: "t",
        body: `<a onclick="x()" href="#">a</a><!-- c --><p onmouseover="y()">p</p>`,
        createdAt: null,
      }),
    )
    assert.strictEqual(post.body, `<a href="#">a</a><p>p</p>`)
  })

  it("rewriteArchivedLinks()는 자기 링크를 상대 경로로, 허용 도메인은 원본으로 바꿔야 합니다.", () => {
    const rule = rewriteArchivedLinks({
      self: "http://agile.egloos.com",
      allowedPrefixes: ["http://www.yes24.com"],
    })
    const input = [
      `<a href="https://web.archive.org/web/2020/http://agile.egloos.com/123">a</a>`,
      `<img src="https://web.archive.org/web/2020im_/http://www.yes24.com/i.png">`,
      `<a href="https://web.archive.org/web/2020/http://other.com/x">o</a>`,
    ].join("")
    assert.strictEqual(
      rule(input),
      `<a href="/123">a</a><img src="http://www.yes24.com/i.png"><a href="https://web.archive.org/web/2020/http://other.com/x">o</a>`,
    )
  })
})
