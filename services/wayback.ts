import { getLogger } from "@logtape/logtape";
import type { Page } from "../models/page.ts";
import { parseRawPages, type RawPages } from "../models/raw-pages.ts";

export interface WaybackMachineService {
  getTimemap(url: string, pattern: string): Promise<RawPages>;
  getArchive(page: Page): Promise<string>;
  listAvailableArchives(url: string): Promise<Page[]>;
}

const logger = getLogger(["downloader", "wayback-machine-service"]);

export function buildArchiveUrl(
  { timestamp, url }: Page,
): string {
  return `https://web.archive.org/web/${timestamp}/${url}`;
}

export class WaybackMachineServiceImpl implements WaybackMachineService {
  // TODO: Make this configurable
  async getTimemap(url: string, pattern: string): Promise<RawPages> {
    logger.debug(`Called getTilemap({url}, {pattern})`, { url, pattern });

    const timemapUrl = `https://web.archive.org/web/timemap/json?url=${
      encodeURIComponent(url)
    }&fl=endtimestamp,original&matchType=prefix&filter=statuscode:200&filter=original:${
      encodeURIComponent(pattern)
    }&filter=mimetype:text/html&collapse=urlkey&limit=150000`;
    const response = await fetch(timemapUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch timemap for ${url}: ${response.statusText}`,
      );
    }
    const data = await response.json();
    return parseRawPages(data);
  }

  async getArchive(page: Page): Promise<string> {
    const { timestamp, url } = page;
    logger.debug(`Called getArchive({timestamp}, {url})`, { timestamp, url });

    const archiveUrl = buildArchiveUrl(page);
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch archive for ${url} at ${timestamp}: ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    const charsetMatch = contentType?.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1] : null;
    const decoder = new TextDecoder(charset || "utf-8");
    const buffer = await response.arrayBuffer();
    return decoder.decode(buffer);
  }

  async listAvailableArchives(url: string): Promise<Page[]> {
    logger.debug(`Called listAvailableArchives({url})`, { url });

    const availableArchiveUrl =
      `https://web.archive.org/cdx/search/cdx?url=${url}&output=json&fl=original,timestamp&filter=mimetype:text/html&filter=statuscode:200`;
    const response = await fetch(availableArchiveUrl);
    if (!response.ok) {
      // Retry if the response is a 504 Gateway Timeout
      if (response.status === 504) {
        return this.listAvailableArchives(
          url,
        );
      }

      throw new Error(
        `Failed to fetch available pages for ${url}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    logger.debug(`Inspect archives list: {data}`, { data });
    return data.slice(1).map((page: any) => {
      const [original, timestamp] = page;
      return { timestamp, url: original };
    });
  }
}
