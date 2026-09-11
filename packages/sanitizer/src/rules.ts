/** 본문 HTML 문자열에 적용하는 순수 규칙. */
export type BodyRule = (body: string) => string

export const removeInlineHandlers: BodyRule = (body) => body.replace(/\son[a-z]+="[^"]*"/gi, "")

export const removeHtmlComments: BodyRule = (body) => body.replace(/<!--[\s\S]*?-->/g, "")

export const composeRules =
  (...rules: ReadonlyArray<BodyRule>): BodyRule =>
  (body) =>
    rules.reduce((acc, rule) => rule(acc), body)

/** 수집 시 저장 전에 적용하는 기본 규칙 묶음. */
export const defaultRules: ReadonlyArray<BodyRule> = [removeInlineHandlers, removeHtmlComments]
