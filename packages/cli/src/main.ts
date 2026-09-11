import { collectPosts, exportDataset, syncSnapshots } from "@agilestory/pipeline"
import { JsonFileDatasetWriter } from "@agilestory/storage"
import { archiveUrl } from "@agilestory/wayback"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import { Effect, Layer } from "effect"
import { Argument, Command, Flag } from "effect/unstable/cli"
import { dataPath, egloosSource } from "./config.ts"
import { AppLayer } from "./layers.ts"

const refresh = Flag.Boolean("refresh").pipe(
  Flag.withDefault(false),
  Flag.withDescription("캐시된 스냅샷 목록을 무시하고 다시 받습니다."),
)
const concurrency = Flag.Int("concurrency").pipe(
  Flag.withDefault(8),
  Flag.withDescription("동시에 가져올 페이지 수"),
)

const sync = Command.make("sync", { refresh }).pipe(
  Command.withDescription("Internet Archive 에서 게시글 스냅샷 목록을 동기화합니다."),
  Command.withHandler(({ refresh }) => syncSnapshots(egloosSource, { refresh })),
)

const collect = Command.make("collect", { refresh, concurrency }).pipe(
  Command.withDescription("모든 게시글을 가져와 파싱하고 캐시에 저장합니다."),
  Command.withHandler(({ refresh, concurrency }) =>
    Effect.gen(function* () {
      const snapshots = yield* syncSnapshots(egloosSource, { refresh })
      yield* collectPosts(snapshots, { concurrency })
    }),
  ),
)

const output = Argument.Path("output").pipe(Argument.withDescription("data.json 출력 경로"))

const exportCmd = Command.make("export", { output, concurrency }).pipe(
  Command.withDescription("수집한 게시글을 정제해 data.json 으로 내보냅니다."),
  Command.withHandler(({ output, concurrency }) =>
    Effect.gen(function* () {
      const snapshots = yield* syncSnapshots(egloosSource)
      const collected = yield* collectPosts(snapshots, { concurrency })
      yield* exportDataset(collected, { archiveUrlOf: archiveUrl }).pipe(
        Effect.provide(JsonFileDatasetWriter(output)),
      )
    }),
  ),
)

const root = Command.make("agilestory").pipe(
  Command.withDescription("agilestory.blog 데이터 파이프라인"),
  Command.withSubcommands([sync, collect, exportCmd]),
)

const program = Effect.gen(function* () {
  const path = yield* dataPath
  yield* Command.run(root, { version: "0.1.0" }).pipe(Effect.provide(AppLayer(path)))
}).pipe(Effect.provide(NodeServices.layer))

NodeRuntime.runMain(program)
