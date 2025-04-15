import { getLogger } from "@logtape/logtape";
import { configureLogging } from "./logging.ts";
import { prepareDependencies } from "./dependency.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import { buildArchiveUrl } from "@/services/mod.ts";

async function main() {
  await configureLogging();

  const {
    timeMapLoader,
    contentLoader,
    contentProcessor,
    embeddingService,
  } = await prepareDependencies();

  const baseLogger = getLogger(["downloader", "main"]);
  if (Deno.args.length < 1) {
    baseLogger.error`Invalid arguments: ${Deno.args.join(", ")}`;
    Deno.exit(1);
  }

  if (Deno.args[0] === "download") {
    const logger = baseLogger.getChild("download");

    const timeMap = await timeMapLoader.load();

    logger.info`Loaded ${timeMap.length} pages.`;
    for (const entry of timeMap) {
      const content = contentProcessor.process(
        await contentLoader.load(entry),
      );
      logger.info(
        `Loaded page {timestamp} {url} with title {title} {body}`,
        {
          url: entry.url,
          title: content.title,
          timestamp: entry.timestamp,
          body: content.body,
        },
      );
    }

    logger.info`Finished loading pages.`;
  } else if (Deno.args[0] === "dump-file") {
    const timeMap = await timeMapLoader.load();

    const allContents = await Promise.all(
      timeMap.map((entry) =>
        contentLoader.load(entry).then(contentProcessor.process)
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
    const timeMap = await timeMapLoader.load();

    const allContents = await Promise.all(
      timeMap.map((entry) =>
        contentLoader.load(entry).then((x) => {
          return contentProcessor.process(x);
        }).then(
          (x) => {
            return {
              id: Number(entry.url.match(/(\d+)$/)?.[0]),
              internetArchiveUrl: buildArchiveUrl(entry),
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
      const embedding = await embeddingService.getEmbeddings(strippedBody);
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
