import { Schema } from "effect"

/** 아카이브에 저장된 스냅샷 한 건. timestamp 는 Wayback 형식(YYYYMMDDhhmmss). */
export class Snapshot extends Schema.Class<Snapshot>("Snapshot")({
  timestamp: Schema.String,
  url: Schema.String,
}) {}

export const SnapshotList = Schema.Array(Snapshot)
export type SnapshotList = typeof SnapshotList.Type

/** 수집 대상 정의. url 은 prefix 매칭, pattern 은 원본 URL 필터 정규식. */
export class ArchiveSource extends Schema.Class<ArchiveSource>("ArchiveSource")({
  url: Schema.String,
  pattern: Schema.String,
}) {
  /** 저장소 키로 쓰기 위한 안정적인 식별자. */
  get key(): string {
    return `${this.url}#${this.pattern}`
  }
}
