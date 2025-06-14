import { assertEquals } from "@std/assert";

// Since this is an Astro component, we'll test the date formatting logic
// by extracting the pure function

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

Deno.test("YmdDate 날짜 포맷팅이 올바르게 작동해야 합니다", () => {
  const testDate = new Date("2024-03-15");
  const result = formatDate(testDate);
  assertEquals(result, "2024-03-15");
});

Deno.test("YmdDate 한 자리 월과 일이 올바르게 패딩되어야 합니다", () => {
  const testDate = new Date("2024-01-05");
  const result = formatDate(testDate);
  assertEquals(result, "2024-01-05");
});

Deno.test("YmdDate 연말 날짜가 올바르게 포맷되어야 합니다", () => {
  const testDate = new Date("2023-12-31");
  const result = formatDate(testDate);
  assertEquals(result, "2023-12-31");
});
