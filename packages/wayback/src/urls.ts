import type { ArchiveSource, Snapshot } from "@agilestory/core"

const BASE = "https://web.archive.org"

/** 스냅샷의 Wayback 열람 URL. */
export const archiveUrl = ({ timestamp, url }: Snapshot): string =>
  `${BASE}/web/${timestamp}/${url}`

/** source 에 매칭되는 원본 URL 당 최신 스냅샷 하나(endtimestamp)를 얻는 timemap URL. */
export const timeMapUrl = ({ url, pattern }: ArchiveSource): string => {
  const params = new URLSearchParams({
    url,
    fl: "endtimestamp,original",
    matchType: "prefix",
    collapse: "urlkey",
    limit: "150000",
  })
  const filters = ["statuscode:200", `original:${pattern}`, "mimetype:text/html"]
    .map((f) => `filter=${encodeURIComponent(f)}`)
    .join("&")
  return `${BASE}/web/timemap/json?${params}&${filters}`
}

/** 특정 원본 URL 의 모든 스냅샷을 얻는 CDX URL. */
export const cdxUrl = (url: string): string =>
  `${BASE}/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&filter=mimetype:text/html&filter=statuscode:200`
