import { assertEquals, assertExists } from "@std/assert";
import { KVPersistentTimeMapRepository } from "./persistent.ts";
import { InMemoryKeyValueStore } from "../../infra/storage/kv/memory.ts";
import type { TimeMap } from "../../models/timemap.ts";
import type { KeyValueStore } from "@/infra/storage/kv/mod.ts";
import { timestamp } from "drizzle-orm/gel-core";

Deno.test("KVPersistentTimeMapRepository", async (t) => {
  let kvStore: KeyValueStore;
  let repository: KVPersistentTimeMapRepository;

  const setup = () => {
    kvStore = new InMemoryKeyValueStore();
    repository = new KVPersistentTimeMapRepository(kvStore);
  };

  await t.step(
    "get()은 KeyValueStore에서 TimeMap을 가져와야 합니다.",
    async () => {
      setup();
      const testTimeMap: TimeMap = [
        { timestamp: "20230201000000", url: "https://example.com/postA" },
        { timestamp: "20230205000000", url: "https://example.com/postB" },
      ];
      await kvStore.set("index", testTimeMap);

      const retrievedTimeMap = await repository.get();

      assertExists(retrievedTimeMap);
      assertEquals(retrievedTimeMap, testTimeMap);
    },
  );

  await t.step(
    "get()은 저장된 TimeMap이 없으면 undefined를 반환해야 합니다",
    async () => {
      setup();

      const retrievedTimeMap = await repository.get();

      assertEquals(retrievedTimeMap, undefined);
    },
  );

  await t.step(
    "get()은 저장된 데이터가 유효한 TimeMap 형식이 아니면 undefined를 반환해야 합니다",
    async () => {
      setup();
      await kvStore.set("index", "invalid data");
      assertEquals(await repository.get(), undefined);

      await kvStore.set("index", { invalid: "data" });
      assertEquals(await repository.get(), undefined);

      await kvStore.set("index", [{ timestamp: "20230101000000" }]);
      assertEquals(await repository.get(), undefined);

      await kvStore.set("index", [{ url: "https://example.com" }]);
      assertEquals(await repository.get(), undefined);
    },
  );

  await t.step(
    "save()는 TimeMap을 KeyValueStore에 저장해야 합니다",
    async () => {
      setup();
      const testTimeMap: TimeMap = [
        { timestamp: "20230101000000", url: "https://example.com/post1" },
        { timestamp: "20230102000000", url: "https://example.com/post2" },
        { timestamp: "20230102000001", url: "https://example.com/post3" },
      ];

      await repository.save(testTimeMap);

      const storedValue = await kvStore.get("index");
      assertExists(storedValue);
      assertEquals(storedValue.value, testTimeMap);
    },
  );

  await t.step("save()는 기존 TimeMap을 덮어써야 합니다", async () => {
    setup();
    const initialTimeMap: TimeMap = [{
      timestamp: "20210301000000",
      url: "https://example.com/initial",
    }];
    const updatedTimeMap: TimeMap = [{
      timestamp: "20240301000000",
      url: "https://example.com/updated",
    }];

    await repository.save(initialTimeMap);
    let storedValue = await kvStore.get("index");
    assertExists(storedValue);
    assertEquals(storedValue.value, initialTimeMap);

    await repository.save(updatedTimeMap);
    storedValue = await kvStore.get("index");
    assertExists(storedValue);
    assertEquals(storedValue.value, updatedTimeMap);

    const retrievedTimeMap = await repository.get();
    assertExists(retrievedTimeMap);
    assertEquals(retrievedTimeMap, updatedTimeMap);
  });
});
