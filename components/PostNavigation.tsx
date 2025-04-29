import * as constants from "../constants.ts";

interface PostNavigationProps {
  prevPost: {
    title: string;
    createdAt: Date;
    id: number;
  } | null;
  nextPost: {
    title: string;
    createdAt: Date;
    id: number;
  } | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav class="w-full">
      <ul class="flex flex-row justify-between w-full gap-4">
        {prevPost && (
          <li class="w-1/2 text-sm font-semibold text-left">
            <a
              href={`/${prevPost.id}`}
              class="inline-block p-2 rounded hover:bg-gray-100 w-full"
            >
              <p>{"<"} {constants.PREVIOUS_POST_MESSAGE}</p>
              <p class="text-gray-600 break-words">{prevPost.title}</p>
            </a>
          </li>
        )}
        {!prevPost && nextPost && <li class="w-1/2"></li>}
        {nextPost && (
          <li class="w-1/2 text-sm font-semibold text-right">
            <a
              href={`/${nextPost.id}`}
              class="inline-block p-2 rounded hover:bg-gray-100 w-full"
            >
              <p>{constants.NEXT_POST_MESSAGE} {">"}</p>
              <p class="text-gray-600 break-words">{nextPost.title}</p>
            </a>
          </li>
        )}
        {prevPost && !nextPost && <li class="w-1/2"></li>}
      </ul>
    </nav>
  );
}
