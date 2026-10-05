export type Comparator<T> = (a: T, b: T) => number;

export async function pingUrl(url: string): Promise<number | null> {
  const startTime = performance.now();
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
    const endTime = performance.now();
    return endTime - startTime;
  } catch (_) {
    return null;
  }
}

export async function findBestPing(
  urls: string[],
): Promise<{ url: string; ping: number } | null> {
  const allPings = await Promise.all(
    urls.map((url) =>
      pingUrl(url).then((ping) => (ping !== null ? { url, ping } : null)),
    ),
  );
  if (!allPings) {
    return null;
  }
  return allPings
    .filter((result) => result !== null)
    .reduce((a, b) => (b.ping < a.ping ? b : a));
}
