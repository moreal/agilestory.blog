import { DatasetWriter, type Post, RawPost, Snapshot } from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { exportDataset } from "./export.ts"

describe("exportDataset", () => {
  it.effect("id를 URL에서 추출하고 작성일 순으로 정렬해 써야 합니다.", () =>
    Effect.gen(function* () {
      let written: ReadonlyArray<Post> = []
      const Writer = Layer.succeed(DatasetWriter)({
        write: (posts: ReadonlyArray<Post>) =>
          Effect.sync(() => {
            written = posts
          }),
      })
      const item = (id: string, createdAt: string | null) => ({
        snapshot: new Snapshot({ timestamp: "1", url: `http://x/${id}` }),
        post: new RawPost({ title: id, body: "", createdAt }),
      })
      yield* exportDataset([item("2", "2020/02/01"), item("1", "2020/01/01"), item("abc", null)], {
        archiveUrlOf: (s) => `A/${s.timestamp}/${s.url}`,
      }).pipe(Effect.provide(Writer))
      assert.deepStrictEqual(
        written.map((p) => p.id),
        [1, 2],
      )
      assert.strictEqual(written[0]?.internetArchiveUrl, "A/1/http://x/1")
      assert.strictEqual(written[0]?.sourceUrl, "http://x/1")
    }),
  )
})
