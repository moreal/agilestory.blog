import type { BodyRule } from "./rules.ts"

export interface LinkRewriteOptions {
  /** 이 prefix 로 시작하는 원본 링크는 사이트 내부 상대 경로로 바꾼다. */
  readonly self: string
  /** 아카이브 래핑을 벗겨 원본 그대로 두는 외부 도메인 prefix 목록. */
  readonly allowedPrefixes: ReadonlyArray<string>
}

const ARCHIVED_ATTR = /(href|src)="https:\/\/web\.archive\.org\/web\/[^/]+\/(http[^"]+)"/g

/**
 * Wayback 이 래핑한 `href`/`src` 를 되돌린다.
 * 자기 블로그 링크는 상대 경로, 허용 도메인은 원본 URL, 그 밖은 아카이브 링크 유지.
 */
export const rewriteArchivedLinks =
  ({ self, allowedPrefixes }: LinkRewriteOptions): BodyRule =>
  (body) =>
    body.replace(ARCHIVED_ATTR, (match, attribute: string, url: string) => {
      if (url.startsWith(self)) return `${attribute}="${url.slice(self.length)}"`
      if (allowedPrefixes.some((prefix) => url.startsWith(prefix))) return `${attribute}="${url}"`
      return match
    })
