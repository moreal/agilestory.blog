import { useEffect, useMemo, useState } from "preact/hooks";
import { SearchResultItem, type SearchResultPost } from "./SearchResultItem";
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

  // Get initial query from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    if (q) {
      setQuery(q);
    }
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("q") as string;

    if (searchQuery) {
      setQuery(searchQuery.trim());
      // Update URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery.trim());
      window.history.pushState({}, "", url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.trim()) {
      setQuery("");
      // Clear URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.pushState({}, "", url);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[680px] w-full">
        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              onChange={handleInputChange}
              placeholder="검색할 키워드를 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              검색
            </button>
          </form>
        </div>

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
