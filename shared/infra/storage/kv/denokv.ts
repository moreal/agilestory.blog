import { KeyValueStore } from "./interface.ts";

export class DenoKvKeyValueStore implements KeyValueStore {
  private constructor(private readonly kv: Deno.Kv) {}

  static async create(path?: string): Promise<DenoKvKeyValueStore> {
    const kv = await Deno.openKv(path);
    return new DenoKvKeyValueStore(kv);
  }

  async get(key: string): Promise<{ value: unknown } | undefined> {
    const result = await this.kv.get([key]);

    if (result.value === null) {
      return undefined;
    }

    return { value: result.value };
  }

  async set(
    key: string,
    value: NonNullable<unknown>,
    options?: { expireIn?: number },
  ): Promise<void> {
    await this.kv.set([key], value, options);
  }

  close(): void {
    this.kv.close();
  }
}
