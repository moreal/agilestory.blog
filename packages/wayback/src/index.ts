import {
  ArchivedDocument,
  ArchiveFetcher,
  ArchiveIndex,
  FetchError,
  IndexError,
  Snapshot,
} from "@agilestory/core"
import { Effect, Layer, Schema } from "effect"
import type { HttpClient } from "effect/unstable/http"
import { decodeBody, defaultRetryPolicy, makeResilientClient, type RetryPolicy } from "./http.ts"
import { archiveUrl, cdxUrl, timeMapUrl } from "./urls.ts"

export type { RetryPolicy } from "./http.ts"
export { archiveUrl, cdxUrl, timeMapUrl } from "./urls.ts"

/** Wayback JSON 응답: 첫 행은 헤더, 이후는 [timestamp, original] 튜플. */
const RawRows = Schema.Array(Schema.Tuple([Schema.String, Schema.String]))
const decodeRows = Schema.decodeUnknownEffect(RawRows)

const toSnapshots = (rows: ReadonlyArray<readonly [string, string]>) =>
  rows.map(([timestamp, url]) => new Snapshot({ timestamp, url }))

const fetchSnapshotRows = (client: HttpClient.HttpClient, url: string) =>
  Effect.gen(function* () {
    const response = yield* client.get(url)
    const json = yield* response.json
    const rows = Array.isArray(json) ? json.slice(1) : json
    return toSnapshots(yield* decodeRows(rows))
  })

/** Internet Archive 기반 ArchiveIndex 구현. */
export const WaybackArchiveIndex = (policy: RetryPolicy = defaultRetryPolicy) =>
  Layer.effect(ArchiveIndex)(
    Effect.gen(function* () {
      const client = yield* makeResilientClient(policy)
      const withIndexError = (url: string) =>
        Effect.mapError(
          (cause: unknown) =>
            new IndexError({ url, cause, message: `스냅샷 목록 조회 실패: ${url}` }),
        )
      return {
        list: (source) =>
          fetchSnapshotRows(client, timeMapUrl(source)).pipe(
            Effect.withLogSpan("wayback.list"),
            withIndexError(source.url),
          ),
        snapshotsOf: (url) =>
          fetchSnapshotRows(client, cdxUrl(url)).pipe(
            Effect.withLogSpan("wayback.snapshotsOf"),
            withIndexError(url),
          ),
      }
    }),
  )

/** Internet Archive 기반 ArchiveFetcher 구현. */
export const WaybackArchiveFetcher = (policy: RetryPolicy = defaultRetryPolicy) =>
  Layer.effect(ArchiveFetcher)(
    Effect.gen(function* () {
      const client = yield* makeResilientClient(policy)
      return {
        fetch: (snapshot) =>
          Effect.gen(function* () {
            const response = yield* client.get(archiveUrl(snapshot))
            const html = yield* decodeBody(response)
            return new ArchivedDocument({ snapshot, html })
          }).pipe(
            Effect.withLogSpan("wayback.fetch"),
            Effect.mapError(
              (cause) =>
                new FetchError({
                  url: snapshot.url,
                  timestamp: snapshot.timestamp,
                  cause,
                  message: `아카이브 가져오기 실패: ${archiveUrl(snapshot)}`,
                }),
            ),
          ),
      }
    }),
  )

/** 두 어댑터를 함께 제공. HttpClient 는 외부에서 주입한다. */
export const WaybackLayer = (policy: RetryPolicy = defaultRetryPolicy) =>
  Layer.mergeAll(WaybackArchiveIndex(policy), WaybackArchiveFetcher(policy))
