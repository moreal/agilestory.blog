CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"createdAt" timestamp,
	"internetArchiveUrl" text,
	"embedding" vector(1024) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "posts" USING hnsw ("embedding" vector_cosine_ops);