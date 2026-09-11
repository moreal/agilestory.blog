import { join } from "node:path"
import { EgloosPostParser } from "@agilestory/parser"
import { DefaultPostSanitizer } from "@agilestory/sanitizer"
import {
  FileSystemKeyValueStore,
  KVPostRepository,
  KVSnapshotRepository,
} from "@agilestory/storage"
import { WaybackLayer } from "@agilestory/wayback"
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient"
import * as NodeServices from "@effect/platform-node/NodeServices"
import { Layer } from "effect"

/** 파일 캐시 + Wayback + 이글루스 파서로 구성한 운영용 의존성 묶음. */
export const AppLayer = (dataPath: string) => {
  const snapshots = KVSnapshotRepository.pipe(
    Layer.provide(FileSystemKeyValueStore(join(dataPath, "pages"))),
  )
  const posts = KVPostRepository.pipe(
    Layer.provide(FileSystemKeyValueStore(join(dataPath, "contents"))),
  )
  return Layer.mergeAll(
    snapshots,
    posts,
    WaybackLayer(),
    EgloosPostParser,
    DefaultPostSanitizer,
  ).pipe(Layer.provide(NodeHttpClient.layerUndici), Layer.provideMerge(NodeServices.layer))
}
