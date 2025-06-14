export function FloatingButton() {
  const scrollTop = () => {
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollTop}
      type="button"
      class="group fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-110 active:scale-95 transition-all duration-300 ease-out z-50 backdrop-blur-sm border border-white/20"
      aria-label="맨 위로 이동"
      title="맨 위로 이동"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 transform group-hover:-translate-y-0.5 transition-transform duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}
