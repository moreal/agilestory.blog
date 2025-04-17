import type { KeyValueStore } from "@/repositories/kv/interface.ts";

export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly store: Map<string, unknown>;

  constructor() {
    this.store = new Map<string, unknown>();
  }

  get(key: string): Promise<{ value: unknown } | undefined> {
    return Promise.resolve(
      this.store.has(key) ? { value: this.store.get(key) } : undefined,
    );
  }

  set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }
}
