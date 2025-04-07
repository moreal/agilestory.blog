import { join } from "jsr:@std/path";
import { FileKeyValueStore } from "@/repositories/kv/mod.ts";
import { PersistentRawContentRepository } from "@/repositories/raw-content/mod.ts";
import { PersistentRawPagesRepository } from "@/repositories/raw-pages/mod.ts";
import {
  RawContentLoader,
  RawContentProcessor,
  RawPagesLoader,
  WaybackMachineServiceImpl,
} from "@/services/mod.ts";

export async function prepareDependencies() {
  const AGILEDATA_PATH = Deno.env.get("AGILEDATA") || "data";
  const rawPagesRepository = new PersistentRawPagesRepository(
    await FileKeyValueStore.create(join(AGILEDATA_PATH, "pages")),
  );
  const rawContentRepository = new PersistentRawContentRepository(
    await FileKeyValueStore.create(join(AGILEDATA_PATH, "contents")),
  );
  const rawContentProcessor = new RawContentProcessor();
  const rawPagesLoader = new RawPagesLoader(
    rawPagesRepository,
    new WaybackMachineServiceImpl(),
  );
  const rawContentLoader = new RawContentLoader(
    rawContentRepository,
    new WaybackMachineServiceImpl(),
  );

  return {
    rawPagesLoader,
    rawContentLoader,
    rawContentProcessor,
  };
}
