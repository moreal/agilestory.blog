import { PostRepository, RawPost } from "@agilestory/core"
import { Effect, Layer, Option, Schema } from "effect"
import { KeyValueStore } from "../kv/interface.ts"

const decode = Schema.decodeUnknownEffect(RawPost)

/** KeyValueStore 위에 구현한 게시글 저장소. 키는 원본 URL. */
export const KVPostRepository = Layer.effect(PostRepository)(
  Effect.gen(function* () {
    const kv = yield* KeyValueStore
    return {
      get: (url) =>
        kv.get(url).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.succeedNone,
              onSome: (raw) => decode(raw).pipe(Effect.option),
            }),
          ),
        ),
      save: (url, post) => kv.set(url, post),
    }
  }),
)
