import { generateKeyBetween } from "fractional-indexing";

export function nextOrderKey(lastKey: string | null): string {
  return generateKeyBetween(lastKey, null);
}

export function orderKeyBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}
