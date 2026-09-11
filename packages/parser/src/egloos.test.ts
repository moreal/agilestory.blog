import { ArchivedDocument, Snapshot } from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { parseEgloos } from "./egloos.ts"

const doc = (html: string) =>
  new ArchivedDocument({
    snapshot: new Snapshot({ timestamp: "20200101000000", url: "http://agile.egloos.com/1" }),
    html,
  })

describe("parseEgloos", () => {
  it.effect("제목, 본문, 작성일을 추출해야 합니다.", () =>
    Effect.gen(function* () {
      const post = yield* parseEgloos(
        doc(
          `<div class="POST_TTL"> 제목 </div><div class="POST_BODY"><p>본문</p></div><a class="time">2010/01/02 03:04</a>`,
        ),
      )
      assert.strictEqual(post.title, "제목")
      assert.strictEqual(post.body, "<p>본문</p>")
      assert.strictEqual(post.createdAt, "2010/01/02 03:04")
    }),
  )

  it.effect("작성일 요소가 없으면 createdAt은 null이어야 합니다.", () =>
    Effect.gen(function* () {
      const post = yield* parseEgloos(
        doc(`<div class="POST_TTL">t</div><div class="POST_BODY">b</div>`),
      )
      assert.isNull(post.createdAt)
    }),
  )

  it.effect("제목 요소가 없으면 ParseError로 실패해야 합니다.", () =>
    Effect.gen(function* () {
      const result = yield* parseEgloos(doc(`<div class="POST_BODY">b</div>`)).pipe(Effect.flip)
      assert.strictEqual(result._tag, "ParseError")
      assert.strictEqual(result.url, "http://agile.egloos.com/1")
    }),
  )
})
