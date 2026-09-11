import { type Duration, Effect, Schedule } from "effect"
import { HttpClient, type HttpClientError, type HttpClientResponse } from "effect/unstable/http"

export interface RetryPolicy {
  readonly times: number
  readonly baseDelay: Duration.Input
}

export const defaultRetryPolicy: RetryPolicy = { times: 3, baseDelay: "2 seconds" }

const isTransient = (error: HttpClientError.HttpClientError): boolean =>
  error.reason._tag === "TransportError" ||
  (error.reason._tag === "StatusCodeError" && error.reason.response.status === 504)

/**
 * 504 Gateway Timeout 과 전송 오류만 지수 백오프로 재시도하고,
 * 그 밖의 비정상 상태 코드는 즉시 실패로 취급하는 HttpClient.
 */
export const makeResilientClient = (policy: RetryPolicy) =>
  Effect.map(HttpClient.HttpClient, (client) =>
    client.pipe(
      HttpClient.filterStatusOk,
      HttpClient.retry({
        while: isTransient,
        schedule: Schedule.exponential(policy.baseDelay).pipe(Schedule.jittered),
        times: policy.times,
      }),
    ),
  )

/** 응답 본문을 Content-Type 의 charset 으로 디코드한다(EUC-KR 등 옛 인코딩 대응). */
export const decodeBody = (
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<string, HttpClientError.HttpClientError> =>
  Effect.gen(function* () {
    const contentType = response.headers["content-type"] ?? ""
    const charset = /charset=([^;]+)/i.exec(contentType)?.[1]?.trim() ?? "utf-8"
    const bytes = yield* response.arrayBuffer
    return new TextDecoder(charset).decode(bytes)
  })
