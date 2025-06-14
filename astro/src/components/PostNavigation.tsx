import * as constants from "../../../shared/constants.ts";

interface Post {
  title: string;
  id: number;
}

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
}

function NavigationItem(
  { post: { id, title }, navigationMessage: _navigationMessage, textOrder }: {
    post: Post;
    navigationMessage: string;
    textOrder: "left" | "right";
  },
) {
  const textOrderClass = textOrder === "left" ? "text-left" : "text-right";
  const arrowIcon = textOrder === "left" ? "←" : "→";

  return (
    <li class={`flex-1 ${textOrderClass}`}>
      <a
        href={`/${id}`}
        class="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
      >
        <div class="text-xs text-blue-600 font-medium mb-1">
          {arrowIcon} {textOrder === "left" ? "이전 글" : "다음 글"}
        </div>
        <p class="text-sm font-medium text-gray-900 line-clamp-2">
          {title}
        </p>
      </a>
    </li>
  );
}

function NavigationSpacer() {
  return <li class="flex-1"></li>;
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
    <nav class="mt-8 mb-8">
      <div class="max-w-4xl mx-auto">
        <ul class="flex gap-4">
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
      </div>
    </nav>
  );
}
