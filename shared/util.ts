export type Comparator<T> = (a: T, b: T) => number;

export async function findBestPing(
  urls: string[],
): Promise<{ url: string; ping: number } | null> {
  const aborter = new AbortController();
  let best;
  try {
    best = await Promise.any(
      urls.map(async (url) => {
        const startTime = performance.now();
        await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          signal: aborter.signal,
        });
        const endTime = performance.now();
        return { url, ping: endTime - startTime };
      }),
    );
  } catch (err) {
    console.log("Ping error", err);
    return null;
  }
  aborter.abort();
  console.log("Finished pinging", urls, "found best", best);
  return best;
}
