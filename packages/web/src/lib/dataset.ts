import raw from "virtual:agilestory-web/dataset"
import { decodeDataset, type Post } from "@agilestory/core"
import { rewriteArchivedLinks } from "@agilestory/sanitizer"
import { site } from "./config.ts"

/** 작성일이 있는 게시글. createdAt 은 Date 로 변환된다. */
export type PublishedPost = Omit<Post, "createdAt"> & { readonly createdAt: Date }

/** data.json 전체(작성일 없는 글 포함). */
export const dataset = decodeDataset(raw)

/** 작성일이 있는 게시글만, 작성일 오름차순. */
export const posts: ReadonlyArray<PublishedPost> = dataset
  .filter((post) => post.createdAt !== null)
  .map((post) => ({ ...post, createdAt: new Date(post.createdAt as string) }))
  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

export const findPost = (id: number) => posts.find((post) => post.id === id)

/** 렌더링 직전 본문 변환: 아카이브 링크 되돌리기, 구분선 여백. */
const rewriteLinks = rewriteArchivedLinks({
  self: site.origin,
  allowedPrefixes: site.allowedLinkPrefixes,
})

export const renderBody = (body: string): string =>
  rewriteLinks(body.replaceAll("<hr>", '<hr class="my-4">'))
