import * as constants from "../constants.ts";

interface Post {
  title: string;
  id: number;
}

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
}

function NavigationItem(
  { id, title, navigationMessage, textOrder }: Post & {
    navigationMessage: string;
    textOrder: "left" | "right";
  },
) {
  return (
    <li class={`w-1/2 text-sm font-semibold text-${textOrder}`}>
      <a
        href={`/${id}`}
        class="inline-block p-2 rounded hover:bg-gray-100 w-full"
      >
        <p>{navigationMessage}</p>
        <p class="text-gray-600 break-words">{title}</p>
      </a>
    </li>
  );
}

function NavigationSpacer() {
  return <li class="w-1/2"></li>;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav class="w-full">
      <ul class="flex flex-row justify-between w-full gap-4">
        {prevPost && (
          <NavigationItem
            {...prevPost}
            navigationMessage={`< ${constants.PREVIOUS_POST_MESSAGE}`}
            textOrder="left"
          />
        )}
        {!prevPost && nextPost && <NavigationSpacer />}
        {nextPost && (
          <NavigationItem
            {...nextPost}
            navigationMessage={`> ${constants.NEXT_POST_MESSAGE}`}
            textOrder="right"
          />
        )}
        {prevPost && !nextPost && <NavigationSpacer />}
      </ul>
    </nav>
  );
}
