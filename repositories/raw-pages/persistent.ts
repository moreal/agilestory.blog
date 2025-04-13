import { parseRawPages, type RawPages } from "../../models/raw-pages.ts";
import type { KeyValueStore } from "../kv/mod.ts";
import type { RawPagesRepository } from "./common.ts";

export class KVPersistentRawPagesRepository implements RawPagesRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  get(): Promise<RawPages | undefined> {
    return this.keyValueStore.get("index").then((rawPages) => {
      if (!rawPages) {
        return undefined;
      }

      return parseRawPages(rawPages);
    });
  }

  save(data: RawPages): Promise<void> {
    return this.keyValueStore.set("index", data);
  }
}
