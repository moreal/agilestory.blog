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
    <li class="w-full list-none">
      <a
        class="flex flex-col gap-2 p-3 hover:bg-gray-50 rounded-md"
        href={`${id}`}
      >
        <div class="flex flex-row gap-4 items-start">
          <YmdDate
            date={createdAt}
            class="font-light w-24 text-gray-400 text-xs"
          />
          <span class="border-b-2 font-medium">{title}</span>
        </div>
        {snippet && (
          <div class="text-sm text-gray-600 ml-28 search-snippet">
            <span dangerouslySetInnerHTML={{ __html: snippet }} />
          </div>
        )}
      </a>
    </li>
  );
}
