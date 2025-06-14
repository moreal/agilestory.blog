import { assertEquals } from "@std/assert";
import {
  escapeRegex,
  extractSnippet,
  stripHtml,
} from "../../shared/services/snippet.ts";

Deno.test("Astro 통합: extractSnippet이 검색 결과 스니펫을 생성해야 합니다", () => {
  const text =
    "이 블로그에는 애자일 방법론에 대한 이야기가 담겨 있습니다. 애자일은 소프트웨어 개발에서 중요한 개념입니다.";
  const keyword = "애자일";

  const result = extractSnippet(text, keyword);

  // Should contain the keyword highlighted
  assertEquals(result.includes("<strong>애자일</strong>"), true);
  assertEquals(result.includes("방법론"), true);
});

Deno.test("Astro 통합: stripHtml이 HTML 태그를 제거해야 합니다", () => {
  const htmlText =
    "<p>이 블로그에는 <strong>애자일</strong> 방법론에 대한 이야기가 있습니다.</p>";

  const result = stripHtml(htmlText);

  assertEquals(result, "이 블로그에는 애자일 방법론에 대한 이야기가 있습니다.");
});

Deno.test("Astro 통합: escapeRegex가 정규식 특수문자를 이스케이프해야 합니다", () => {
  const specialChars = "hello.*+?^${}()|[]\\world";

  const result = escapeRegex(specialChars);

  assertEquals(result, "hello\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world");
});

Deno.test("Astro 통합: 검색 기능이 한국어 키워드로 작동해야 합니다", () => {
  const text = "애자일 개발은 반복적이고 점진적인 개발 방법론입니다.";
  const keyword = "개발";

  const result = extractSnippet(text, keyword);

  assertEquals(result.includes("<strong>개발</strong>"), true);
});
