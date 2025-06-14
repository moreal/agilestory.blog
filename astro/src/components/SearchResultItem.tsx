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
    <article className="group">
      <a
        className="block hover:text-blue-600 transition-colors duration-200"
        href={`${id}`}
      >
        <div className="flex items-baseline gap-4">
          <YmdDate
            date={createdAt}
            className="text-sm text-gray-500 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h3>
            {snippet && (
              <div className="mt-1 text-sm text-gray-600 search-snippet">
                <span dangerouslySetInnerHTML={{ __html: snippet }} />
              </div>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
