import { DatasetWriter, Post, type RawPost, type Snapshot } from "@agilestory/core"
import { Effect } from "effect"
import type { Collected } from "./collect.ts"

export interface ExportOptions {
  /** 원본 URL 에서 숫자 id 를 뽑는다. 기본: 경로 마지막 숫자. */
  readonly idOf?: (url: string) => number | undefined
  /** 스냅샷의 열람 URL. */
  readonly archiveUrlOf: (snapshot: Snapshot) => string
}

const defaultIdOf = (url: string) => {
  const match = /(\d+)$/.exec(url)
  return match ? Number(match[1]) : undefined
}

export const toPost = (
  { snapshot, post }: { snapshot: Snapshot; post: RawPost },
  options: ExportOptions,
): Post | undefined => {
  const id = (options.idOf ?? defaultIdOf)(snapshot.url)
  if (id === undefined) return undefined
  return new Post({
    id,
    sourceUrl: snapshot.url,
    internetArchiveUrl: options.archiveUrlOf(snapshot),
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
  })
}

const byCreatedAt = (a: Post, b: Post) =>
  new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()

/** 수집 결과를 Post 로 변환해 작성일 순으로 정렬하고 DatasetWriter 로 내보낸다. */
export const exportDataset = Effect.fn("exportDataset")(function* (
  collected: ReadonlyArray<Collected>,
  options: ExportOptions,
) {
  const writer = yield* DatasetWriter
  const posts = collected
    .map((c) => toPost(c, options))
    .filter((p): p is Post => p !== undefined)
    .sort(byCreatedAt)
  yield* writer.write(posts)
  yield* Effect.logInfo(`게시글 ${posts.length}건 내보내기 완료`)
  return posts
})
