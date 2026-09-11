import {
  ArchiveIndex,
  type ArchiveSource,
  type Snapshot,
  SnapshotRepository,
} from "@agilestory/core"
import { Effect, Option } from "effect"

/**
 * 스냅샷 목록을 캐시에서 읽고, 없으면 아카이브 인덱스에서 받아 저장한다.
 * `refresh` 가 true 면 캐시를 무시하고 항상 새로 받는다.
 */
export const syncSnapshots = Effect.fn("syncSnapshots")(function* (
  source: ArchiveSource,
  options: { readonly refresh?: boolean } = {},
) {
  const repo = yield* SnapshotRepository
  const index = yield* ArchiveIndex

  if (!options.refresh) {
    const cached = yield* repo.get(source)
    if (Option.isSome(cached)) {
      yield* Effect.logDebug(`캐시된 스냅샷 ${cached.value.length}건 사용`)
      return cached.value as ReadonlyArray<Snapshot>
    }
  }

  const snapshots = yield* index.list(source)
  yield* repo.save(source, snapshots)
  yield* Effect.logInfo(`스냅샷 ${snapshots.length}건 동기화 완료`)
  return snapshots
})
