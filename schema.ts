import { cosineDistance, desc, gt, like, or, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";
import type { Database } from "./db.ts";
import type { EmbeddingService } from "@/services/embedding/mod.ts";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text().notNull(),
  body: text().notNull(),
  createdAt: timestamp(),
  internetArchiveUrl: text().notNull(),
  embedding: vector({ dimensions: 1024 }).notNull(),
}, (table) => [
  index("embeddingIndex").using(
    "hnsw",
    table.embedding.op("vector_cosine_ops"),
  ),
]);

export async function safeGeneratingEmbedding(
  embeddingService: EmbeddingService,
  text: string,
): Promise<
  {
    status: "ok";
    embedding: number[];
  } | {
    status: "error";
  }
> {
  try {
    return {
      status: "ok",
      embedding: await embeddingService.getEmbeddings(text),
    };
  } catch {
    return {
      status: "error",
    };
  }
}

export async function searchPosts(
  embeddingService: EmbeddingService,
  db: Database,
  keyword: string,
  limit = 10,
) {
  const embeddingResult = await safeGeneratingEmbedding(
    embeddingService,
    keyword,
  );

  let embeddingSimilarity;
  if (embeddingResult.status === "ok") {
    embeddingSimilarity = sql<number>`1 - (${
      cosineDistance(postsTable.embedding, embeddingResult.embedding)
    })`;
  } else {
    embeddingSimilarity = sql<number>`0.0`;
  }

  const similarity = sql<number>`${embeddingSimilarity} + (CASE
    WHEN (${like(postsTable.title, `%${keyword}%`)}) THEN 1
    ELSE 0
  END) + (CASE
    WHEN (${like(postsTable.body, `%${keyword}%`)}) THEN 1
    ELSE 0
  END)`;

  const result = await db.select({
    id: postsTable.id,
    title: postsTable.title,
    createdAt: postsTable.createdAt,
    similarity,
  })
    .from(postsTable)
    .where(
      or(gt(similarity, 0.5)),
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);

  return result as {
    id: number;
    title: string;
    createdAt: Date;
    similarity: number;
  }[];
}

// Example of selecting posts with vector similarity
export async function getPostsBySimilarity(
  embeddingService: EmbeddingService,
  db: Database,
  keyword: string,
  limit = 10,
) {
  const embedding = await embeddingService.getEmbeddings(keyword);

  const similarity = sql<number>`1 - (${
    cosineDistance(postsTable.embedding, embedding)
  })`;

  const result = db.select({
    id: postsTable.id,
    title: postsTable.title,
    createdAt: postsTable.createdAt,
    similarity,
  })
    .from(postsTable)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(limit);

  return result;
}
