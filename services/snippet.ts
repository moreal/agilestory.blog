/**
 * Strip HTML tags from text content
 * @param html HTML content to clean
 * @returns Plain text content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/**
 * Escape special regex characters in a string
 * @param str String to escape
 * @returns Escaped string safe for regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract a snippet from text around the first occurrence of the keyword
 * @param text The full text to search in
 * @param keyword The keyword to find
 * @param maxLength Maximum length of the snippet (default: 150)
 * @returns A snippet with the keyword highlighted, or empty string if not found
 */
export function extractSnippet(text: string, keyword: string, maxLength = 150): string {
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