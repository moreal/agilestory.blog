import { Data } from "effect"

/** 아카이브 인덱스(스냅샷 목록) 조회 실패. */
export class IndexError extends Data.TaggedError("IndexError")<{
  readonly url: string
  readonly cause?: unknown
  readonly message: string
}> {}

/** 아카이브 원문 가져오기 실패. */
export class FetchError extends Data.TaggedError("FetchError")<{
  readonly url: string
  readonly timestamp: string
  readonly cause?: unknown
  readonly message: string
}> {}

/** HTML 에서 게시글 구조를 찾지 못함. */
export class ParseError extends Data.TaggedError("ParseError")<{
  readonly url: string
  readonly timestamp: string
  readonly message: string
}> {}

/** 저장소 읽기/쓰기 실패. */
export class StorageError extends Data.TaggedError("StorageError")<{
  readonly key: string
  readonly cause?: unknown
  readonly message: string
}> {}

/** 어떤 스냅샷으로도 게시글을 얻지 못함. */
export class PostUnavailable extends Data.TaggedError("PostUnavailable")<{
  readonly url: string
  readonly attempts: number
}> {}
