import { Schema } from "effect"
import { Snapshot } from "./snapshot.ts"

/** 아카이브에서 가져온 원문 HTML 과 그 출처 스냅샷. */
export class ArchivedDocument extends Schema.Class<ArchivedDocument>("ArchivedDocument")({
  snapshot: Snapshot,
  html: Schema.String,
}) {}
