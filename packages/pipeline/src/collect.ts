import {
  ArchiveFetcher,
  ArchiveIndex,
  PostParser,
  PostRepository,
  PostSanitizer,
  PostUnavailable,
  type RawPost,
  type Snapshot,
} from "@agilestory/core"
import { Effect, Option } from "effect"

/** 스냅샷 하나를 가져와 파싱한다. 실패는 호출자가 폴백 판단에 쓴다. */
const fetchAndParse = (snapshot: Snapshot) =>
  Effect.gen(function* () {
    const fetcher = yield* ArchiveFetcher
    const parser = yield* PostParser
    const document = yield* fetcher.fetch(snapshot)
    return yield* parser.parse(document)
  })

/**
 * 대표 스냅샷으로 파싱을 시도하고, 실패하면 같은 URL 의 다른 스냅샷을
 * 최신순으로 차례로 시도한다. 성공한 게시글은 정제 후 저장한다.
 */
const collectFromArchive = Effect.fn("collectFromArchive")(function* (snapshot: Snapshot) {
  const index = yield* ArchiveIndex
  const sanitizer = yield* PostSanitizer

  const primary = yield* fetchAndParse(snapshot).pipe(Effect.option)
  if (Option.isSome(primary)) return sanitizer.sanitize(primary.value)

  yield* Effect.logWarning(`대표 스냅샷 파싱 실패, 다른 스냅샷 탐색: ${snapshot.url}`)
  const alternatives = (yield* index.snapshotsOf(snapshot.url))
    .filter((s) => s.timestamp !== snapshot.timestamp)
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  for (const alternative of alternatives) {
    const result = yield* fetchAndParse(alternative).pipe(Effect.option)
    if (Option.isSome(result)) {
      yield* Effect.logInfo(
        `대체 스냅샷 ${alternative.timestamp} 에서 게시글 확보: ${snapshot.url}`,
      )
      return sanitizer.sanitize(result.value)
    }
  }

  return yield* new PostUnavailable({ url: snapshot.url, attempts: alternatives.length + 1 })
})

/** 캐시 우선으로 게시글 하나를 얻는다. 캐시 미스 시 아카이브에서 수집해 저장한다. */
export const collectPost = Effect.fn("collectPost")(function* (snapshot: Snapshot) {
  const repo = yield* PostRepository
  const cached = yield* repo.get(snapshot.url)
  if (Option.isSome(cached)) return cached.value

  const post: RawPost = yield* collectFromArchive(snapshot)
  yield* repo.save(snapshot.url, post)
  return post
})

export interface CollectOptions {
  readonly concurrency?: number
}

/** 스냅샷 목록 전체를 수집한다. 실패한 항목은 건너뛰고 성공한 것만 돌려준다. */
export const collectPosts = Effect.fn("collectPosts")(function* (
  snapshots: ReadonlyArray<Snapshot>,
  options: CollectOptions = {},
) {
  const results = yield* Effect.forEach(
    snapshots,
    (snapshot) =>
      collectPost(snapshot).pipe(
        Effect.map((post) => Option.some({ snapshot, post })),
        Effect.catchCause((cause) =>
          Effect.logError(`게시글 수집 실패: ${snapshot.url}`, cause).pipe(
            Effect.as(Option.none()),
          ),
        ),
      ),
    { concurrency: options.concurrency ?? 8 },
  )
  const collected = results.filter(Option.isSome).map((r) => r.value)
  yield* Effect.logInfo(`${snapshots.length}건 중 ${collected.length}건 수집 완료`)
  return collected
})

export type Collected = { readonly snapshot: Snapshot; readonly post: RawPost }
