import { assert, describe, it } from "@effect/vitest"
import { egloos } from "./blog.ts"

describe("egloos", () => {
  it("아이디로 origin과 수집 정의를 만들어야 합니다.", () => {
    const blog = egloos("agile")
    assert.strictEqual(blog.origin, "http://agile.egloos.com")
    assert.strictEqual(blog.source.url, "agile.egloos.com/")
    assert.match("http://agile.egloos.com/123", new RegExp(blog.source.pattern))
    assert.notMatch("http://agile.egloos.com/tag/x", new RegExp(blog.source.pattern))
  })
})
