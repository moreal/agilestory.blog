import { type ArchiveSource, Snapshot, SnapshotRepository, StorageError } from "@agilestory/core"
import { Effect, Layer, Option, Schema } from "effect"
import { KeyValueStore } from "../kv/interface.ts"

const decode = Schema.decodeUnknownEffect(Schema.Array(Snapshot))

/** KeyValueStore 위에 구현한 스냅샷 목록 저장소. 잘못된 형식은 없는 것으로 취급한다. */
export const KVSnapshotRepository = Layer.effect(SnapshotRepository)(
  Effect.gen(function* () {
    const kv = yield* KeyValueStore
    return {
      get: (source: ArchiveSource) =>
        kv.get(source.key).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.succeedNone,
              onSome: (raw) => decode(raw).pipe(Effect.option),
            }),
          ),
        ),
      save: (source, snapshots) => kv.set(source.key, snapshots),
    }
  }),
)

export { StorageError }
