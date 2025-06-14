import { type Content, safeParseContent } from "../../models/content.ts";
import type { KeyValueStore } from "../../infra/storage/kv/mod.ts";
import type { ContentRepository } from "./interface.ts";

export class KVPersistentContentRepository implements ContentRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  get(url: string): Promise<Content | undefined> {
    return this.keyValueStore.get(url).then((result) => {
      if (!result) {
        return undefined;
      }

      const parsed = safeParseContent(result.value);
      if (parsed.success) {
        return parsed.data;
      }

      return undefined;
    });
  }

  save(url: string, content: Content): Promise<void> {
    return this.keyValueStore.set(url, content);
  }
}
