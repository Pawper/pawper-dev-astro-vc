const _cache: Record<string, string[]> = {};

export function populateHeadingCache(data: Record<string, string[]>): void {
  if (Object.keys(_cache).length > 0) return;
  Object.assign(_cache, data);
}

export function getLogHeadingIds(logId: string): string[] {
  return _cache[logId] ?? [];
}
