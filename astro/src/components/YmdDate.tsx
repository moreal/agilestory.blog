function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

interface YmdDateProps {
  date: Date;
  class?: string;
}

export function YmdDate(props: YmdDateProps) {
  const defaultClass = "text-sm font-medium text-gray-500";
  const className = props.class || defaultClass;

  return (
    <time
      class={className}
      dateTime={props.date.toISOString()}
      title={props.date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })}
    >
      {formatDate(props.date)}
    </time>
  );
}
