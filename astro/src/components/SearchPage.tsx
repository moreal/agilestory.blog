import { useEffect, useMemo, useState } from "preact/hooks";
import {
  SearchResultItem,
  type SearchResultPost,
} from "./SearchResultItem.tsx";
import { extractSnippet } from "../../../shared/services/snippet.ts";

interface Post {
  id: number;
  title: string;
  body: string;
  createdAt: string | null;
}

interface SearchPageProps {
  posts: Post[];
}

export function SearchPage({ posts }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"no-query" | "no-results" | "success">(
    "no-query",
  );

  // Filter valid posts on component mount
  const validPosts = useMemo(
    () => posts.filter((post) => post.createdAt !== null),
    [posts],
  );

  // Get initial query from URL on component mount and listen for URL changes
  useEffect(() => {
    const updateQueryFromURL = () => {
      const urlParams = new URLSearchParams(globalThis.location.search);
      const q = urlParams.get("q");
      setQuery(q || "");
    };

    // Set initial query
    updateQueryFromURL();

    // Listen for popstate events (back/forward button)
    globalThis.addEventListener("popstate", updateQueryFromURL);

    // Listen for URL changes (if using pushState)
    const originalPushState = globalThis.history.pushState;
    globalThis.history.pushState = function (...args) {
      originalPushState.apply(globalThis.history, args);
      updateQueryFromURL();
    };

    return () => {
      globalThis.removeEventListener("popstate", updateQueryFromURL);
      globalThis.history.pushState = originalPushState;
    };
  }, []);

  // Perform search when query changes
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      setStatus("no-query");
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResultPost[] = [];

    for (const post of validPosts) {
      const titleMatch = post.title.toLowerCase().includes(lowerQuery);
      const bodyMatch = post.body.toLowerCase().includes(lowerQuery);

      if (titleMatch || bodyMatch) {
        let snippet = "";

        // First try to find the keyword in the title
        if (titleMatch) {
          snippet = extractSnippet(post.title, query, 100);
        }

        // If no title match or title snippet is too short, try body
        if (!snippet || snippet.length < 20) {
          const bodySnippet = extractSnippet(post.body, query);
          if (bodySnippet) {
            snippet = bodySnippet;
          }
        }

        results.push({
          id: post.id,
          title: post.title,
          createdAt: new Date(post.createdAt!),
          snippet,
        });
      }
    }

    // Sort by relevance: title matches first, then by date
    results.sort((a, b) => {
      const aHasQueryInTitle = a.title.toLowerCase().includes(lowerQuery);
      const bHasQueryInTitle = b.title.toLowerCase().includes(lowerQuery);

      if (aHasQueryInTitle && !bHasQueryInTitle) return -1;
      if (!aHasQueryInTitle && bHasQueryInTitle) return 1;

      // If both have or don't have query in title, sort by date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Limit to 10 results
    const limitedResults = results.slice(0, 10);

    if (limitedResults.length > 0) {
      setStatus("success");
    } else {
      setStatus("no-results");
    }

    return limitedResults;
  }, [query, validPosts]);

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[680px] w-full">
        {/* Search Results */}
        {status === "no-query" && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                검색을 시작해보세요
              </h2>
              <p className="text-gray-600">
                찾고 싶은 내용의 키워드를 입력해 주세요.
              </p>
            </div>
          </div>
        )}

        {status === "no-results" && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                "<span className="text-blue-600">{query}</span>" 검색 결과가
                없습니다
              </h2>
              <p className="text-gray-600">다른 검색어를 시도해 보세요.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                "<span className="text-blue-600">{query}</span>" 검색 결과
              </h2>
              <p className="text-sm text-gray-500">
                {searchResults.length}개 발견
              </p>
            </div>

            <div className="space-y-6">
              {searchResults.map((result) => (
                <SearchResultItem key={result.id} post={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
