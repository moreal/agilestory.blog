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

// Database schema definition
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

// Domain-specific types for search
export type PostSearchResult = {
  id: number;
  title: string;
  createdAt: Date;
  similarity: number;
};

// Error handling for embedding generation
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
  } catch (error) {
    console.error("Error generating embedding:", error);
    return {
      status: "error",
    };
  }
}

// Text processor for search queries
export class SearchTextProcessor {
  static prepare(text: string): string {
    return text
      .replaceAll("�", "")
      .replaceAll(/<[^>]*>/g, " ")
      .replaceAll(/(https?:\/\/[^\s]+)/g, "")
      .replaceAll("&nbsp;", " ")
      .replaceAll(/\s+/g, " ")
      .trim();
  }
}

// Search service for finding posts
export class PostSearchService {
  constructor(
    private readonly db: Database,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Search for posts based on keyword with combined similarity scoring
   */
  async search(keyword: string, limit = 10): Promise<PostSearchResult[]> {
    // Generate embeddings for the search keyword
    const embeddingResult = await safeGeneratingEmbedding(
      this.embeddingService,
      SearchTextProcessor.prepare(keyword),
    );

    // Calculate similarity score
    const query = this.buildSearchQuery(keyword, embeddingResult, limit);

    try {
      const result = await query;
      return result as PostSearchResult[];
    } catch (error) {
      console.error("Error executing search query:", error);
      throw new Error(`Failed to execute search: ${error.message}`);
    }
  }

  private buildSearchQuery(
    keyword: string,
    embeddingResult: Awaited<ReturnType<typeof safeGeneratingEmbedding>>,
    limit: number,
  ) {
    // Calculate embedding similarity if available
    let embeddingSimilarity;
    if (embeddingResult.status === "ok") {
      embeddingSimilarity = sql<number>`1 - (${
        cosineDistance(postsTable.embedding, embeddingResult.embedding)
      })`;
    } else {
      // Fallback for embedding generation failure
      embeddingSimilarity = sql<number>`0.0`;
    }

    // Combined similarity score with text matching
    const similarity = sql<number>`${embeddingSimilarity} + (CASE
      WHEN (${like(postsTable.title, `%${keyword}%`)}) THEN 1
      ELSE 0
    END) + (CASE
      WHEN (${like(postsTable.body, `%${keyword}%`)}) THEN 1
      ELSE 0
    END)`;

    // Execute the search query
    return this.db.select({
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
  }
}

// Legacy function adapters for backward compatibility
export function searchPosts(
  embeddingService: EmbeddingService,
  db: Database,
  keyword: string,
  limit = 10,
): Promise<PostSearchResult[]> {
  const searchService = new PostSearchService(db, embeddingService);
  return searchService.search(keyword, limit);
}
