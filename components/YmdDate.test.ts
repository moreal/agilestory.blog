import { assertEquals } from "@std/assert";
import { YmdDate } from "@/components/YmdDate.tsx";

Deno.test("YmdDate는 날짜를 YYYY-MM-DD 형식으로 렌더링해야 합니다", () => {
  const date = new Date("2023-03-15T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2023-03-15");
});

Deno.test("YmdDate는 한 자리 월을 두 자리로 패딩해야 합니다", () => {
  const date = new Date("2023-01-05T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2023-01-05");
});

Deno.test("YmdDate는 한 자리 일을 두 자리로 패딩해야 합니다", () => {
  const date = new Date("2023-12-01T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2023-12-01");
});

Deno.test("YmdDate는 12월을 올바르게 처리해야 합니다", () => {
  const date = new Date("2023-12-31T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2023-12-31");
});

Deno.test("YmdDate는 1월을 올바르게 처리해야 합니다", () => {
  const date = new Date("2023-01-01T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2023-01-01");
});

Deno.test("YmdDate는 윤년을 올바르게 처리해야 합니다", () => {
  const date = new Date("2024-02-29T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2024-02-29");
});

Deno.test("YmdDate는 과거 날짜를 올바르게 처리해야 합니다", () => {
  const date = new Date("1990-05-20T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "1990-05-20");
});

Deno.test("YmdDate는 미래 날짜를 올바르게 처리해야 합니다", () => {
  const date = new Date("2030-11-15T10:30:00Z");

  const result = YmdDate({ date });

  assertEquals(result.type, "span");
  assertEquals(result.props.children, "2030-11-15");
});

Deno.test("YmdDate는 class 속성을 전달해야 합니다", () => {
  const date = new Date("2023-03-15T10:30:00Z");
  const cssClass = "custom-date-class";

  const result = YmdDate({ date, class: cssClass });

  assertEquals(result.type, "span");
  assertEquals(result.props.class, cssClass);
  assertEquals(result.props.children, "2023-03-15");
});
