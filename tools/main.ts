import { RawPagesMapper } from "@/mappers/mod.ts";
import { getLogger } from "@logtape/logtape";
import { configureLogging } from "./logging.ts";
import { prepareDependencies } from "./dependency.ts";
import { db } from "@/db.ts";
import { generateEmbedding, postsTable } from "@/schema.ts";
import { buildArchiveUrl } from "@/services/mod.ts";

async function main() {
  await configureLogging();

  const { rawPagesLoader, rawContentLoader, rawContentProcessor } =
    await prepareDependencies();

  const baseLogger = getLogger(["downloader", "main"]);
  if (Deno.args.length < 1) {
    baseLogger.error`Invalid arguments: ${Deno.args.join(", ")}`;
    Deno.exit(1);
  }

  if (Deno.args[0] === "download") {
    const logger = baseLogger.getChild("download");

    const rawPages = await rawPagesLoader.load();
    const pages = new RawPagesMapper().toPages(rawPages);

    logger.info`Loaded ${pages.length} pages.`;
    for (const page of pages) {
      const rawContent = await rawContentLoader.load(page);
      const content = rawContentProcessor.process(rawContent);
      logger.info(
        `Loaded page {timestamp} {url} with title {title} {body}`,
        {
          url: page.url,
          title: content.title,
          timestamp: page.timestamp,
          body: content.body,
        },
      );
    }

    logger.info`Finished loading pages.`;
  } else if (Deno.args[0] === "dump-file") {
    const rawPages = await rawPagesLoader.load();
    const pages = new RawPagesMapper().toPages(rawPages);

    const allContents = await Promise.all(
      pages.map((page) =>
        rawContentLoader.load(page).then(rawContentProcessor.process)
      ),
    );

    Deno.writeTextFileSync(
      Deno.args[1],
      JSON.stringify(
        allContents.toSorted((a, b) =>
          Number(a.createdAt) - Number(b.createdAt)
        ),
      ),
    );
  } else if (Deno.args[0] === "dump-db") {
    const rawPages = await rawPagesLoader.load();
    const pages = new RawPagesMapper().toPages(rawPages);

    const allContents = await Promise.all(
      pages.map((page) =>
        rawContentLoader.load(page).then((x) => {
          return rawContentProcessor.process(x);
        }).then(
          (x) => {
            return {
              id: Number(page.url.match(/(\d+)$/)?.[0]),
              internetArchiveUrl: buildArchiveUrl(page),
              ...x,
            };
          },
        )
      ),
    );

    const insertValues = [];
    for (const content of allContents) {
      const strippedBody = content.body.replaceAll("�", "").replaceAll(
        /<[^>]*>/g,
        " ",
      ).replaceAll(
        /(https?:\/\/[^\s]+)/g,
        "",
      ).replaceAll(
        "&nbsp;",
        " ",
      ).replaceAll(
        /\s+/g,
        " ",
      ).trim();
      const embedding = await generateEmbedding(strippedBody);
      insertValues.push({
        id: content.id,
        title: content.title,
        body: content.body,
        createdAt: content.createdAt !== null
          ? new Date(content.createdAt)
          : null,
        internetArchiveUrl: content.internetArchiveUrl,
        embedding,
      });
    }

    await db.insert(postsTable).values(insertValues).execute();
  }
}

await main();
