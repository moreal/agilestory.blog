import { YmdDate } from "./YmdDate.tsx";

export interface SearchResultPost {
  id: number;
  title: string;
  createdAt: Date;
  snippet?: string;
}

interface SearchResultItemProps {
  post: SearchResultPost;
}

export function SearchResultItem({ post }: SearchResultItemProps) {
  const { title, createdAt, id, snippet } = post;

  return (
    <article class="group">
      <a
        class="block hover:text-blue-600 transition-colors duration-200"
        href={`${id}`}
      >
        <div class="flex items-baseline gap-4">
          <YmdDate
            date={createdAt}
            class="text-sm text-gray-500 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h3>
            {snippet && (
              <div class="mt-1 text-sm text-gray-600 search-snippet">
                <span dangerouslySetInnerHTML={{ __html: snippet }} />
              </div>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
