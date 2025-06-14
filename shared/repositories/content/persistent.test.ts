import { assertEquals, assertExists } from "@std/assert";
import { KVPersistentContentRepository } from "./persistent.ts";
import { InMemoryKeyValueStore } from "../../infra/storage/kv/memory.ts";
import type { Content } from "../../models/content.ts"; // Correct import path
import type { KeyValueStore } from "../../infra/storage/kv/mod.ts";

Deno.test("KVPersistentContentRepository", async (t) => {
  let kvStore: KeyValueStore;
  let repository: KVPersistentContentRepository;

  const setup = () => {
    kvStore = new InMemoryKeyValueStore();
    repository = new KVPersistentContentRepository(kvStore);
  };

  await t.step(
    "get()은 KeyValueStore에서 Content를 가져와야 합니다.",
    async () => {
      setup();
      const testUrl = "https://example.com/postA";
      // Updated testContent to match the Content model from content.ts
      const testContent: Content = {
        title: "Test Post A",
        body: "This is the body of test post A.",
        createdAt: new Date("2023-02-01T00:00:00Z").toISOString(), // Use ISO string or null
      };
      await kvStore.set(testUrl, testContent);

      const retrievedContent = await repository.get(testUrl);

      assertExists(retrievedContent);
      assertEquals(retrievedContent, testContent);
    },
  );

  await t.step(
    "get()은 저장된 Content가 없으면 undefined를 반환해야 합니다",
    async () => {
      setup();
      const testUrl = "https://example.com/nonexistent";

      const retrievedContent = await repository.get(testUrl);

      assertEquals(retrievedContent, undefined);
    },
  );

  await t.step(
    "get()은 저장된 데이터가 유효한 Content 형식이 아니면 undefined를 반환해야 합니다",
    async () => {
      setup();
      const testUrl = "https://example.com/invalid";
      // Invalid data according to ContentSchema (body is required string)
      const invalidData = { title: "Only Title", createdAt: null };
      await kvStore.set(testUrl, invalidData); // Store invalid data directly

      const retrievedContent = await repository.get(testUrl);

      // Assuming repository.get() uses parseContent and returns undefined on failure
      assertEquals(retrievedContent, undefined);
    },
  );

  await t.step(
    "save()는 Content를 KeyValueStore에 저장해야 합니다",
    async () => {
      setup();
      const testUrl = "https://example.com/post1";
      // Updated testContent to match the Content model
      const testContent: Content = {
        title: "Test Post 1",
        body: "Body of post 1.",
        createdAt: null, // Example with null createdAt
      };

      await repository.save(testUrl, testContent);

      const storedValue = await kvStore.get(testUrl);
      assertExists(storedValue);
      // kvStore stores the raw value, so compare against testContent
      assertEquals(storedValue.value, testContent);
    },
  );

  await t.step("save()는 기존 Content를 덮어써야 합니다", async () => {
    setup();
    const testUrl = "https://example.com/postToUpdate";
    // Updated initialContent to match the Content model
    const initialContent: Content = {
      title: "Initial Title",
      body: "Initial body.",
      createdAt: new Date("2021-03-01T00:00:00Z").toISOString(),
    };
    // Updated updatedContent to match the Content model
    const updatedContent: Content = {
      title: "Updated Title",
      body: "Updated body.",
      createdAt: new Date("2024-03-01T00:00:00Z").toISOString(),
    };

    await repository.save(testUrl, initialContent);
    let storedValue = await kvStore.get(testUrl);
    assertExists(storedValue);
    assertEquals(storedValue.value, initialContent);

    await repository.save(testUrl, updatedContent);
    storedValue = await kvStore.get(testUrl);
    assertExists(storedValue);
    assertEquals(storedValue.value, updatedContent);

    // Verify get() also returns the updated content
    const retrievedContent = await repository.get(testUrl);
    assertExists(retrievedContent);
    assertEquals(retrievedContent, updatedContent);
  });
});
