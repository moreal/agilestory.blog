import { ArchiveSource, Snapshot } from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { archiveUrl, cdxUrl, timeMapUrl } from "./urls.ts"

describe("wayback urls", () => {
  it("archiveUrl()은 timestamp와 원본 URL로 열람 URL을 만들어야 합니다.", () => {
    const url = archiveUrl(new Snapshot({ timestamp: "20200101", url: "http://a.b/1" }))
    assert.strictEqual(url, "https://web.archive.org/web/20200101/http://a.b/1")
  })

  it("timeMapUrl()은 원본 패턴 필터를 인코딩해 포함해야 합니다.", () => {
    const url = timeMapUrl(
      new ArchiveSource({ url: "agile.egloos.com/", pattern: "^http://x/[0-9]+$" }),
    )
    assert.include(url, "filter=original%3A%5Ehttp%3A%2F%2Fx%2F%5B0-9%5D%2B%24")
    assert.include(url, "fl=endtimestamp%2Coriginal")
  })

  it("cdxUrl()은 원본 URL을 인코딩해야 합니다.", () => {
    assert.include(cdxUrl("http://a.b/1"), "url=http%3A%2F%2Fa.b%2F1")
  })
})
