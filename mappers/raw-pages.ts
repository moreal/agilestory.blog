import { type Page, parsePage } from "../models/page.ts";
import type { RawPages } from "../models/raw-pages.ts";

export class RawPagesMapper {
  toPages(rawPages: RawPages): Page[] {
    return rawPages.slice(1).map((rawPage) => {
      const [timestamp, url] = rawPage;
      return parsePage({ timestamp, url });
    });
  }
}
