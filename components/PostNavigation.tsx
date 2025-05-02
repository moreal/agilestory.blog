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
  { post: { id, title }, navigationMessage, textOrder }: {
    post: Post;
    navigationMessage: string;
    textOrder: "left" | "right";
  },
) {
  const textOrderClass = textOrder === "left" ? "text-left" : "text-right";
  return (
    <li class={`w-1/2 text-sm font-semibold ${textOrderClass}`}>
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

function NavigationItemOrSpacer(
  { post, navigationMessage, textOrder }: {
    post: Post | null;
    navigationMessage: string;
    textOrder: "left" | "right";
  },
) {
  if (!post) {
    return <NavigationSpacer />;
  }

  return (
    <NavigationItem
      post={post}
      navigationMessage={navigationMessage}
      textOrder={textOrder}
    />
  );
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav class="w-full">
      <ul class="flex flex-row justify-between w-full gap-4">
        <NavigationItemOrSpacer
          post={prevPost}
          navigationMessage={`< ${constants.PREVIOUS_POST_MESSAGE}`}
          textOrder="left"
        />
        <NavigationItemOrSpacer
          post={nextPost}
          navigationMessage={`${constants.NEXT_POST_MESSAGE} >`}
          textOrder="right"
        />
      </ul>
    </nav>
  );
}
