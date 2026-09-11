import type { Effect, Option } from "effect"
import { Context } from "effect"
import type { FetchError, IndexError, ParseError, StorageError } from "../errors/index.ts"
import type { ArchivedDocument, ArchiveSource, Post, RawPost, Snapshot } from "../models/index.ts"

/** 아카이브의 스냅샷 목록을 제공한다. (Internet Archive CDX 등) */
export class ArchiveIndex extends Context.Service<
  ArchiveIndex,
  {
    /** source 에 매칭되는 모든 원본 URL 에 대해 대표 스냅샷 하나씩. */
    readonly list: (source: ArchiveSource) => Effect.Effect<ReadonlyArray<Snapshot>, IndexError>
    /** 특정 원본 URL 의 모든 스냅샷. */
    readonly snapshotsOf: (url: string) => Effect.Effect<ReadonlyArray<Snapshot>, IndexError>
  }
>()("@agilestory/core/ArchiveIndex") {}

/** 스냅샷의 원문 HTML 을 가져온다. */
export class ArchiveFetcher extends Context.Service<
  ArchiveFetcher,
  {
    readonly fetch: (snapshot: Snapshot) => Effect.Effect<ArchivedDocument, FetchError>
  }
>()("@agilestory/core/ArchiveFetcher") {}

/** 원문 HTML 에서 게시글 구조를 추출한다. 블로그 서비스마다 구현이 다르다. */
export class PostParser extends Context.Service<
  PostParser,
  {
    readonly parse: (document: ArchivedDocument) => Effect.Effect<RawPost, ParseError>
  }
>()("@agilestory/core/PostParser") {}

/** 게시글 본문을 정제한다. 순수 변환. */
export class PostSanitizer extends Context.Service<
  PostSanitizer,
  {
    readonly sanitize: (post: RawPost) => RawPost
  }
>()("@agilestory/core/PostSanitizer") {}

/** 스냅샷 목록 캐시. */
export class SnapshotRepository extends Context.Service<
  SnapshotRepository,
  {
    readonly get: (
      source: ArchiveSource,
    ) => Effect.Effect<Option.Option<ReadonlyArray<Snapshot>>, StorageError>
    readonly save: (
      source: ArchiveSource,
      snapshots: ReadonlyArray<Snapshot>,
    ) => Effect.Effect<void, StorageError>
  }
>()("@agilestory/core/SnapshotRepository") {}

/** 파싱된 게시글 캐시. 키는 원본 URL. */
export class PostRepository extends Context.Service<
  PostRepository,
  {
    readonly get: (url: string) => Effect.Effect<Option.Option<RawPost>, StorageError>
    readonly save: (url: string, post: RawPost) => Effect.Effect<void, StorageError>
  }
>()("@agilestory/core/PostRepository") {}

/** 최종 데이터셋 출력. */
export class DatasetWriter extends Context.Service<
  DatasetWriter,
  {
    readonly write: (posts: ReadonlyArray<Post>) => Effect.Effect<void, StorageError>
  }
>()("@agilestory/core/DatasetWriter") {}
