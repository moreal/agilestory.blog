import { PostRepository, RawPost } from "@agilestory/core"
import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer, Option } from "effect"
import { KeyValueStore } from "../kv/interface.ts"
import { InMemoryKeyValueStore } from "../kv/memory.ts"
import { KVPostRepository } from "./post.ts"

const TestLayer = KVPostRepository.pipe(Layer.provideMerge(InMemoryKeyValueStore))

describe("KVPostRepository", () => {
  it.effect("get()은 KeyValueStore에서 RawPost를 가져와야 합니다.", () =>
    Effect.gen(function* () {
      const kv = yield* KeyValueStore
      const repo = yield* PostRepository
      const post = new RawPost({ title: "제목", body: "본문", createdAt: "2023-02-01" })
      yield* kv.set("https://example.com/1", post)
      const result = yield* repo.get("https://example.com/1")
      assert.deepStrictEqual(Option.getOrThrow(result), post)
    }).pipe(Effect.provide(TestLayer)),
  )

  it.effect("get()은 저장된 게시글이 없으면 None을 반환해야 합니다.", () =>
    Effect.gen(function* () {
      const repo = yield* PostRepository
      const result = yield* repo.get("https://example.com/none")
      assert.isTrue(Option.isNone(result))
    }).pipe(Effect.provide(TestLayer)),
  )

  it.effect("get()은 저장된 데이터가 RawPost 형식이 아니면 None을 반환해야 합니다.", () =>
    Effect.gen(function* () {
      const kv = yield* KeyValueStore
      const repo = yield* PostRepository
      yield* kv.set("https://example.com/bad", { title: "only" })
      const result = yield* repo.get("https://example.com/bad")
      assert.isTrue(Option.isNone(result))
    }).pipe(Effect.provide(TestLayer)),
  )

  it.effect("save()는 기존 게시글을 덮어써야 합니다.", () =>
    Effect.gen(function* () {
      const repo = yield* PostRepository
      const url = "https://example.com/2"
      yield* repo.save(url, new RawPost({ title: "a", body: "a", createdAt: null }))
      const updated = new RawPost({ title: "b", body: "b", createdAt: "2024-03-01" })
      yield* repo.save(url, updated)
      const result = yield* repo.get(url)
      assert.deepStrictEqual(Option.getOrThrow(result), updated)
    }).pipe(Effect.provide(TestLayer)),
  )
})
