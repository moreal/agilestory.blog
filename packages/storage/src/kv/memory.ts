import { Effect, Layer, Option } from "effect"
import { KeyValueStore } from "./interface.ts"

/** 테스트용 메모리 스토어. */
export const makeInMemoryKeyValueStore = (): KeyValueStore["Service"] => {
  const map = new Map<string, unknown>()
  return {
    get: (key) => Effect.sync(() => Option.fromNullishOr(map.get(key))),
    set: (key, value) => Effect.sync(() => void map.set(key, value)),
  }
}

export const InMemoryKeyValueStore = Layer.sync(KeyValueStore)(makeInMemoryKeyValueStore)
