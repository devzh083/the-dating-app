// front-end/src/lib/utils.ts

// Simple Tailwind class name helper – no extra deps needed
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
