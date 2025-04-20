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

function fetchArchiveAndParse(
  waybackMachineService: WaybackMachineService,
  timeMapEntry: TimeMapEntry,
): Promise<Content | null> {
  return waybackMachineService.getArchive(timeMapEntry).then(parseHtml);
}

export interface ContentLoader {
  load(timeMapEntry: TimeMapEntry): Promise<Content | undefined>;
}

export interface ContentProvider {
  load(timeMapEntry: TimeMapEntry): Promise<Content>;
}

export interface ContentWriter {
  write(url: string, content: Content): Promise<void>;
}

export class RepositoryContentLoader implements ContentLoader {
  constructor(private readonly contentRepository: ContentRepository) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content | undefined> {
    return await this.contentRepository.get(timeMapEntry.url);
  }
}

export class RepositoryContentWriter implements ContentWriter {
  constructor(private readonly contentRepository: ContentRepository) {}

  async write(url: string, content: Content): Promise<void> {
    await this.contentRepository.save(url, content);
  }
}

export class WaybackContentLoader implements ContentLoader {
  constructor(private readonly waybackMachineService: WaybackMachineService) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content | undefined> {
    const content = await fetchArchiveAndParse(
      this.waybackMachineService,
      timeMapEntry,
    );
    if (!content) {
      return undefined;
    }
    return content;
  }
}

export class WaybackFallbackContentLoader implements ContentLoader {
  constructor(
    private readonly waybackMachineService: WaybackMachineService,
  ) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content | undefined> {
    console.log("Title element not found. Retry...");

    const otherArchives =
      (await this.waybackMachineService.listAvailableArchives(timeMapEntry.url))
        .filter((p) => p.timestamp !== timeMapEntry.timestamp)
        .toSorted((a, b) => Number(b.timestamp) - Number(a.timestamp));

    for (const otherArchive of otherArchives) {
      const content = await fetchArchiveAndParse(
        this.waybackMachineService,
        otherArchive,
      );
      if (content) {
        console.log("Found title element in other archive.", otherArchive);
        return content;
      }
    }

    return undefined;
  }
}

export class PersistingContentProvider implements ContentProvider {
  constructor(
    private readonly contentProvider: ContentProvider,
    private readonly contentWriter: ContentWriter,
  ) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content> {
    const content = await this.contentProvider.load(timeMapEntry);
    await this.contentWriter.write(timeMapEntry.url, content);
    return content;
  }
}

export class FallbackContentLoader implements ContentProvider {
  constructor(private readonly loaders: ContentLoader[]) {}

  async load(timeMapEntry: TimeMapEntry): Promise<Content> {
    for (const loader of this.loaders) {
      const content = await loader.load(timeMapEntry);
      if (content) {
        return content;
      }
    }
    throw new Error("Failed to load content from all loaders.");
  }
}
