import {
  ArchivedDocument,
  ArchiveFetcher,
  ArchiveIndex,
  FetchError,
  ParseError,
  PostParser,
  PostRepository,
  PostSanitizer,
  RawPost,
  Snapshot,
} from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer, Option } from "effect"
import { collectPost } from "./collect.ts"

const snap = (timestamp: string, url = "http://agile.egloos.com/1") =>
  new Snapshot({ timestamp, url })

/** html 이 "ok:" 로 시작할 때만 파싱 성공하는 가짜 파서. */
const FakeParser = Layer.succeed(PostParser)({
  parse: (doc: ArchivedDocument) =>
    doc.html.startsWith("ok:")
      ? Effect.succeed(
          new RawPost({ title: doc.html.slice(3), body: "<!-- c -->b", createdAt: null }),
        )
      : Effect.fail(
          new ParseError({
            url: doc.snapshot.url,
            timestamp: doc.snapshot.timestamp,
            message: "no",
          }),
        ),
})

const FakeSanitizer = Layer.succeed(PostSanitizer)({
  sanitize: (p: RawPost) => new RawPost({ ...p, body: p.body.replace(/<!--.*?-->/g, "") }),
})

/** timestamp → html 매핑으로 동작하는 가짜 fetcher / index, 저장 내용을 노출하는 가짜 repo. */
const makeFakes = (pages: Record<string, string>) => {
  const saved = new Map<string, RawPost>()
  const layer = Layer.mergeAll(
    Layer.succeed(ArchiveFetcher)({
      fetch: (s: Snapshot) => {
        const html = pages[s.timestamp]
        return html === undefined
          ? Effect.fail(new FetchError({ url: s.url, timestamp: s.timestamp, message: "404" }))
          : Effect.succeed(new ArchivedDocument({ snapshot: s, html }))
      },
    }),
    Layer.succeed(ArchiveIndex)({
      list: () => Effect.succeed([]),
      snapshotsOf: (url: string) => Effect.succeed(Object.keys(pages).map((t) => snap(t, url))),
    }),
    Layer.succeed(PostRepository)({
      get: (url: string) => Effect.succeed(Option.fromNullishOr(saved.get(url))),
      save: (url: string, post: RawPost) => Effect.sync(() => void saved.set(url, post)),
    }),
    FakeParser,
    FakeSanitizer,
  )
  return { layer, saved }
}

describe("collectPost", () => {
  it.effect("대표 스냅샷 파싱에 성공하면 정제해서 저장해야 합니다.", () =>
    Effect.gen(function* () {
      const { layer, saved } = makeFakes({ "1": "ok:제목" })
      const post = yield* collectPost(snap("1")).pipe(Effect.provide(layer))
      assert.strictEqual(post.title, "제목")
      assert.strictEqual(post.body, "b")
      assert.strictEqual(saved.get("http://agile.egloos.com/1")?.title, "제목")
    }),
  )

  it.effect("대표 스냅샷이 실패하면 다른 스냅샷을 최신순으로 시도해야 합니다.", () =>
    Effect.gen(function* () {
      const { layer } = makeFakes({ "1": "bad", "3": "bad", "2": "ok:둘" })
      const post = yield* collectPost(snap("1")).pipe(Effect.provide(layer))
      assert.strictEqual(post.title, "둘")
    }),
  )

  it.effect("모든 스냅샷이 실패하면 PostUnavailable 로 실패해야 합니다.", () =>
    Effect.gen(function* () {
      const { layer } = makeFakes({ "1": "bad", "2": "bad" })
      const error = yield* collectPost(snap("1")).pipe(Effect.provide(layer), Effect.flip)
      assert.strictEqual(error._tag, "PostUnavailable")
    }),
  )

  it.effect("캐시된 게시글이 있으면 아카이브를 호출하지 않아야 합니다.", () =>
    Effect.gen(function* () {
      const { layer, saved } = makeFakes({})
      saved.set(
        "http://agile.egloos.com/1",
        new RawPost({ title: "cached", body: "", createdAt: null }),
      )
      const post = yield* collectPost(snap("1")).pipe(Effect.provide(layer))
      assert.strictEqual(post.title, "cached")
    }),
  )
})
