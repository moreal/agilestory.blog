export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${
    String(date.getMonth() + 1).padStart(2, "0")
  }-${String(date.getDate()).padStart(2, "0")}`;
}

interface YmdDateProps {
  date: Date;
  class?: string;
}

export function YmdDate(props: YmdDateProps) {
  return (
    <span class={props.class}>
      {formatDate(props.date)}
    </span>
  );
}
