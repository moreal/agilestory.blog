import { safeParseTimeMap, type TimeMap } from "../../models/timemap.ts";
import type { KeyValueStore } from "../../infra/storage/kv/mod.ts";
import type { TimeMapRepository } from "./interface.ts";

export class KVPersistentTimeMapRepository implements TimeMapRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  get(): Promise<TimeMap | undefined> {
    return this.keyValueStore.get("index").then((timeMap) => {
      if (!timeMap) {
        return undefined;
      }

      const parsed = safeParseTimeMap(timeMap.value);
      if (parsed.success) {
        return parsed.data;
      }

      return undefined;
    });
  }

  save(data: TimeMap): Promise<void> {
    return this.keyValueStore.set("index", data);
  }
}
