import { Schema } from "effect"

/** 파싱 직후, 정제 전 게시글. */
export class RawPost extends Schema.Class<RawPost>("RawPost")({
  title: Schema.String,
  body: Schema.String,
  createdAt: Schema.NullOr(Schema.String),
}) {}

/** 정제가 끝난 게시글. data.json 의 원소 형식이며 기존 필드명을 유지한다. */
export class Post extends Schema.Class<Post>("Post")({
  id: Schema.Number,
  sourceUrl: Schema.optionalKey(Schema.String),
  internetArchiveUrl: Schema.String,
  title: Schema.String,
  body: Schema.String,
  createdAt: Schema.NullOr(Schema.String),
}) {}

export const Dataset = Schema.Array(Post)
export type Dataset = typeof Dataset.Type

export const decodeDataset = Schema.decodeUnknownSync(Dataset)
