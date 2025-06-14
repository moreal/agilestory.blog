export interface KeyValueStore {
  get(key: string): Promise<{ value: unknown } | undefined>;
  set(key: string, value: unknown): Promise<void>;
}
