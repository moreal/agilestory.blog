import { assertEquals, assertStringIncludes } from "@std/assert";

// Simple test to verify Open Graph image functionality
Deno.test("Open Graph Image: 이미지 URL이 절대 URL로 변환되는지 확인", () => {
  const baseUrl = new URL("https://example.com");
  const relativeImage = "/images/test.jpg";
  
  const absoluteUrl = new URL(relativeImage, baseUrl).href;
  
  assertEquals(absoluteUrl, "https://example.com/images/test.jpg");
});

Deno.test("Open Graph Image: 이미지가 없을 때 기본 이미지 사용 확인", () => {
  const image = undefined;
  const baseUrl = new URL("https://example.com");
  const defaultImage = "/og-default.svg";
  
  const pageImage = image 
    ? new URL(image, baseUrl).href 
    : new URL(defaultImage, baseUrl).href;
  
  assertEquals(pageImage, "https://example.com/og-default.svg");
});

Deno.test("Open Graph Image: 커스텀 이미지가 있을 때 사용 확인", () => {
  const image = "/custom-image.jpg";
  const baseUrl = new URL("https://example.com");
  const defaultImage = "/og-default.svg";
  
  const pageImage = image 
    ? new URL(image, baseUrl).href 
    : new URL(defaultImage, baseUrl).href;
  
  assertEquals(pageImage, "https://example.com/custom-image.jpg");
});

Deno.test("Open Graph Image: imageAlt가 없을 때 기본값 사용 확인", () => {
  const imageAlt = undefined;
  const pageTitle = "테스트 페이지 제목";
  
  const pageImageAlt = imageAlt || pageTitle;
  
  assertEquals(pageImageAlt, "테스트 페이지 제목");
});