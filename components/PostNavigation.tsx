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
      <ul class="flex flex-col justify-between w-full gap-4">
        {prevPost && (
          <li class="w-full text-sm font-semibold text-left">
            <a
              href={`/${prevPost.id}`}
            >
              <p>{"<"} {constants.PREVIOUS_POST_MESSAGE}</p>
              <p class="text-gray-600">{prevPost.title}</p>
            </a>
          </li>
        )}
        {nextPost && (
          <li class="w-full text-sm font-semibold text-right">
            <a
              href={`/${nextPost.id}`}
            >
              <p>{constants.NEXT_POST_MESSAGE} {">"}</p>
              <p class="text-gray-600">{nextPost.title}</p>
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
