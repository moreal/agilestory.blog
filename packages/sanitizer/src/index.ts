import { PostSanitizer, RawPost } from "@agilestory/core"
import { Layer } from "effect"
import { type BodyRule, composeRules, defaultRules } from "./rules.ts"

export * from "./links.ts"
export * from "./rules.ts"

export const makeSanitizer = (rules: ReadonlyArray<BodyRule> = defaultRules) => {
  const apply = composeRules(...rules)
  return {
    sanitize: (post: RawPost): RawPost => new RawPost({ ...post, body: apply(post.body) }),
  }
}

export const DefaultPostSanitizer = Layer.succeed(PostSanitizer)(makeSanitizer())
