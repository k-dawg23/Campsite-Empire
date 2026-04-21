export function makeId(prefix = 'id'): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function choice<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
