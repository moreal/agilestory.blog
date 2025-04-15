import { DOMParser } from "jsr:@b-fuze/deno-dom";
import type { Content } from "../../models/content.ts";
import type { WaybackMachineService } from "../wayback.ts";
import type { ContentRepository } from "../../repositories/content/mod.ts";
import { TimeMapEntry } from "@/models/timemap.ts";

function parseHtml(html: string): Content | null {
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

export class ContentLoader {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly waybackMachineService: WaybackMachineService,
  ) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content> {
    {
      const rawContent = await this.contentRepository.get(timeMapEntry.url);
      if (rawContent) {
        return rawContent;
      }
    }

    const html = await this.waybackMachineService.getArchive(timeMapEntry);
    const rawContent = parseHtml(html);
    if (rawContent) {
      await this.contentRepository.save(timeMapEntry.url, rawContent);
      return rawContent;
    }

    console.log("Title element not found. Retry...");

    const otherArchives =
      (await this.waybackMachineService.listAvailableArchives(timeMapEntry.url))
        .filter(
          (
            p,
          ) => p.timestamp !== timeMapEntry.timestamp,
        ).toSorted((a, b) => Number(b.timestamp) - Number(a.timestamp));

    for (const otherArchive of otherArchives) {
      const html = await this.waybackMachineService.getArchive(otherArchive);
      const content = parseHtml(html);
      if (content) {
        console.log("Found title element in other archive.", otherArchive);
        await this.contentRepository.save(timeMapEntry.url, content);
        return content;
      }
    }

    throw new Error(
      `Title element not found in any archive for ${timeMapEntry.timestamp} ${timeMapEntry.url}`,
    );
  }
}
