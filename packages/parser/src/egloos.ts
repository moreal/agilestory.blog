import { type ArchivedDocument, ParseError, PostParser, RawPost } from "@agilestory/core"
import { Effect, Layer } from "effect"
import { parseHTML } from "linkedom"

/**
 * 이글루스 게시글 파서. `div.POST_TTL`(제목), `div.POST_BODY`(본문), `a.time`(작성일) 을 찾는다.
 */
export const parseEgloos = (document: ArchivedDocument): Effect.Effect<RawPost, ParseError> =>
  Effect.suspend(() => {
    const { document: dom } = parseHTML(document.html)
    const fail = (message: string) =>
      Effect.fail(
        new ParseError({
          url: document.snapshot.url,
          timestamp: document.snapshot.timestamp,
          message,
        }),
      )
    const title = dom.querySelector("div.POST_TTL")
    if (!title) return fail("제목 요소(div.POST_TTL)를 찾지 못했습니다.")
    const body = dom.querySelector("div.POST_BODY")
    if (!body) return fail("본문 요소(div.POST_BODY)를 찾지 못했습니다.")
    const time = dom.querySelector("a.time")
    return Effect.succeed(
      new RawPost({
        title: (title.textContent ?? "").trim(),
        body: body.innerHTML,
        createdAt: time ? (time.textContent ?? "").trim() || null : null,
      }),
    )
  })

export const EgloosPostParser = Layer.succeed(PostParser)({ parse: parseEgloos })
