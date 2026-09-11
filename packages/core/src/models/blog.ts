import { ArchiveSource } from "./snapshot.ts"

/** 수집·렌더링 양쪽에서 쓰는 블로그 정의. */
export interface Blog {
  /** 원본 사이트 origin. 본문 내 자기 링크를 상대 경로로 바꿀 때 쓴다. */
  readonly origin: string
  /** Internet Archive 에서 게시글을 찾기 위한 정의. */
  readonly source: ArchiveSource
}

/** 이글루스 블로그. 아이디만 주면 주소와 수집 정의가 정해진다. (예: "agile" → agile.egloos.com) */
export const egloos = (id: string): Blog => ({
  origin: `http://${id}.egloos.com`,
  source: new ArchiveSource({
    url: `${id}.egloos.com/`,
    pattern: `^http://${id}\\.egloos\\.com/[0-9]+$`,
  }),
})
