export const clamp = (
  num: number,
  { min, max }: { min: number; max: number }
) => Math.min(Math.max(num, min), max);

export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export function objectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as any;
}
