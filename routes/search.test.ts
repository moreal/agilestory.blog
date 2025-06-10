import { assertEquals } from "@std/assert";

/**
 * Strip HTML tags from text content
 * @param html HTML content to clean
 * @returns Plain text content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/**
 * Escape special regex characters in a string
 * @param str String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract a snippet from text around the first occurrence of the keyword
 * @param text The full text to search in
 * @param keyword The keyword to find
 * @param maxLength Maximum length of the snippet (default: 150)
 * @returns A snippet with the keyword highlighted, or empty string if not found
 */
function extractSnippet(text: string, keyword: string, maxLength = 150): string {
  // Strip HTML tags for clean text search and display
  const cleanText = stripHtml(text);
  const lowerText = cleanText.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  
  const index = lowerText.indexOf(lowerKeyword);
  if (index === -1) {
    return "";
  }
  
  // Calculate start and end positions for the snippet
  const halfLength = Math.floor((maxLength - keyword.length) / 2);
  const start = Math.max(0, index - halfLength);
  const end = Math.min(cleanText.length, index + keyword.length + halfLength);
  
  let snippet = cleanText.substring(start, end);
  
  // Add ellipsis if we're not at the beginning/end
  if (start > 0) {
    snippet = "..." + snippet;
  }
  if (end < cleanText.length) {
    snippet = snippet + "...";
  }
  
  // Highlight the keyword (case-insensitive) with escaped regex
  const escapedKeyword = escapeRegex(keyword);
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  snippet = snippet.replace(regex, '<strong>$1</strong>');
  
  return snippet;
}

Deno.test("extractSnippet은 키워드가 포함된 텍스트 스니펫을 추출해야 합니다", () => {
  const text = "이 블로그에는 애자일 방법론(기민한 방법론)에 대한 이야기가 담겨 있습니다. 애자일은 소프트웨어 개발에서 중요한 개념입니다.";
  const keyword = "애자일";
  
  const result = extractSnippet(text, keyword);
  
  // Should contain the keyword highlighted
  assertEquals(result.includes("<strong>애자일</strong>"), true);
  // Should contain context around the keyword
  assertEquals(result.includes("방법론"), true);
});

Deno.test("extractSnippet은 키워드가 없을 때 빈 문자열을 반환해야 합니다", () => {
  const text = "이 텍스트에는 해당 키워드가 없습니다.";
  const keyword = "애자일";
  
  const result = extractSnippet(text, keyword);
  
  assertEquals(result, "");
});

Deno.test("extractSnippet은 대소문자를 구분하지 않고 매칭해야 합니다", () => {
  const text = "Agile methodology is important";
  const keyword = "agile";
  
  const result = extractSnippet(text, keyword);
  
  assertEquals(result.includes("<strong>Agile</strong>"), true);
});

Deno.test("extractSnippet은 긴 텍스트에서 적절한 길이로 스니펫을 생성해야 합니다", () => {
  const longText = "a".repeat(100) + "애자일" + "b".repeat(100);
  const keyword = "애자일";
  
  const result = extractSnippet(longText, keyword, 50);
  
  // Should be around the maxLength
  assertEquals(result.length <= 60, true); // allowing for ellipsis and highlighting tags
  assertEquals(result.includes("..."), true);
  assertEquals(result.includes("<strong>애자일</strong>"), true);
});

Deno.test("stripHtml은 HTML 태그를 제거해야 합니다", () => {
  const htmlText = "<p>이 블로그에는 <strong>애자일</strong> 방법론에 대한 이야기가 있습니다.</p>";
  
  const result = stripHtml(htmlText);
  
  assertEquals(result, "이 블로그에는 애자일 방법론에 대한 이야기가 있습니다.");
});

Deno.test("extractSnippet은 HTML 태그가 포함된 텍스트에서 깨끗한 스니펫을 생성해야 합니다", () => {
  const htmlText = "<p>이 블로그에는 <strong>애자일</strong> 방법론(기민한 방법론)에 대한 이야기가 담겨 있습니다.</p>";
  const keyword = "애자일";
  
  const result = extractSnippet(htmlText, keyword);
  
  // Should not contain HTML tags
  assertEquals(result.includes("<p>"), false);
  assertEquals(result.includes("</p>"), false);
  // Should contain highlighted keyword
  assertEquals(result.includes("<strong>애자일</strong>"), true);
});

Deno.test("escapeRegex는 정규식 특수문자를 이스케이프해야 합니다", () => {
  const specialChars = "hello.*+?^${}()|[]\\world";
  
  const result = escapeRegex(specialChars);
  
  assertEquals(result, "hello\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world");
});

Deno.test("extractSnippet은 정규식 특수문자가 포함된 키워드를 처리해야 합니다", () => {
  const text = "This is a test with (parentheses) and [brackets].";
  const keyword = "(parentheses)";
  
  const result = extractSnippet(text, keyword);
  
  assertEquals(result.includes("<strong>(parentheses)</strong>"), true);
});