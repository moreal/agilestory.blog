import { DOMParser } from "jsr:@b-fuze/deno-dom";
import type { RawContent } from "../../models/raw-content.ts";
import type { WaybackMachineService } from "../wayback.ts";
import type { Page } from "../../models/page.ts";
import type { RawContentRepository } from "../../repositories/raw-content/mod.ts";

function parseHtml(html: string): RawContent | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) {
    return null;
  }

  const postTitleElement = doc.querySelector("div.POST_TTL");
  if (!postTitleElement) {
    return null;
  }

  const postBodyElement = doc.querySelector("div.POST_BODY");
  if (!postBodyElement) {
    return null;
  }

  const timeElement = doc.querySelector("a.time") || null;

  return {
    title: postTitleElement.textContent,
    body: postBodyElement.innerHTML,
    createdAt: timeElement === null ? null : timeElement.innerText,
  };
}

export class RawContentLoader {
  constructor(
    private readonly rawContentRepository: RawContentRepository,
    private readonly waybackMachineService: WaybackMachineService,
  ) {}

  async load(page: Page): Promise<RawContent> {
    {
      const rawContent = await this.rawContentRepository.get(page.url);
      if (rawContent) {
        return rawContent;
      }
    }

    const html = await this.waybackMachineService.getArchive(page);
    const rawContent = parseHtml(html);
    if (rawContent) {
      await this.rawContentRepository.save(page.url, rawContent);
      return rawContent;
    }

    console.log("Title element not found. Retry...");

    const otherArchives =
      (await this.waybackMachineService.listAvailableArchives(page.url)).filter(
        (
          p,
        ) => p.timestamp !== page.timestamp,
      ).toSorted((a, b) => Number(b.timestamp) - Number(a.timestamp));

    for (const otherArchive of otherArchives) {
      const html = await this.waybackMachineService.getArchive(otherArchive);
      const rawContent = parseHtml(html);
      if (rawContent) {
        console.log("Found title element in other archive.", otherArchive);
        await this.rawContentRepository.save(page.url, rawContent);
        return rawContent;
      }
    }

    throw new Error(
      `Title element not found in any archive for ${page.timestamp} ${page.url}`,
    );
  }
}
