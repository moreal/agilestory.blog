import * as path from "jsr:@std/path";

export interface KeyValueStore {
  get(key: string): Promise<{ value: unknown } | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

export class FileKeyValueStore implements KeyValueStore {
  private constructor(private readonly directoryPath: string) {}

  static async create(directoryPath: string): Promise<FileKeyValueStore> {
    await Deno.mkdir(directoryPath, { recursive: true });
    return new FileKeyValueStore(directoryPath);
  }

  async get(key: string): Promise<{ value: unknown } | undefined> {
    try {
      const filePath = this.#buildFilePath(key);
      console.debug(key, filePath);
      const fileContent = await Deno.readTextFile(filePath);
      return JSON.parse(fileContent);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return undefined;
      }
      throw error;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    const filePath = this.#buildFilePath(key);
    await Deno.writeTextFile(filePath, JSON.stringify({ value }));
  }

  #buildFilePath(key: string): string {
    return path.join(this.directoryPath, `${encodeURIComponent(key)}.json`);
  }
}
