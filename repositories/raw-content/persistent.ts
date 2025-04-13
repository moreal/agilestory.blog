import { parseRawContent, type RawContent } from "../../models/raw-content.ts";
import type { KeyValueStore } from "../kv/mod.ts";
import type { RawContentRepository } from "./common.ts";

export class KVPersistentRawContentRepository implements RawContentRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  get(url: string): Promise<RawContent | undefined> {
    return this.keyValueStore.get(url).then((result) => {
      if (!result) {
        return undefined;
      }

      return parseRawContent(result.value);
    });
  }

  save(url: string, content: RawContent): Promise<void> {
    return this.keyValueStore.set(url, content);
  }
}
