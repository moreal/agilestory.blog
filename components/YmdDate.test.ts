import { assertEquals } from "@std/assert";
import { formatDate } from "@/components/YmdDate.tsx";

Deno.test("formatDate는 날짜를 YYYY-MM-DD 형식으로 포맷해야 합니다", () => {
  const date = new Date("2023-03-15T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2023-03-15");
});

Deno.test("formatDate는 한 자리 월을 두 자리로 패딩해야 합니다", () => {
  const date = new Date("2023-01-05T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2023-01-05");
});

Deno.test("formatDate는 한 자리 일을 두 자리로 패딩해야 합니다", () => {
  const date = new Date("2023-12-01T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2023-12-01");
});

Deno.test("formatDate는 12월을 올바르게 처리해야 합니다", () => {
  const date = new Date("2023-12-31T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2023-12-31");
});

Deno.test("formatDate는 1월을 올바르게 처리해야 합니다", () => {
  const date = new Date("2023-01-01T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2023-01-01");
});

Deno.test("formatDate는 윤년을 올바르게 처리해야 합니다", () => {
  const date = new Date("2024-02-29T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2024-02-29");
});

Deno.test("formatDate는 과거 날짜를 올바르게 처리해야 합니다", () => {
  const date = new Date("1990-05-20T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "1990-05-20");
});

Deno.test("formatDate는 미래 날짜를 올바르게 처리해야 합니다", () => {
  const date = new Date("2030-11-15T10:30:00Z");

  const result = formatDate(date);

  assertEquals(result, "2030-11-15");
});
