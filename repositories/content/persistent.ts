import { type Content, parseContent } from "../../models/content.ts";
import type { KeyValueStore } from "@/infra/storage/kv/mod.ts";
import type { ContentRepository } from "./common.ts";

export class KVPersistentContentRepository implements ContentRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  get(url: string): Promise<Content | undefined> {
    return this.keyValueStore.get(url).then((result) => {
      if (!result) {
        return undefined;
      }

      return parseContent(result.value);
    });
  }

  save(url: string, content: Content): Promise<void> {
    return this.keyValueStore.set(url, content);
  }
}
