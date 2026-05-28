import { useEffect, useState } from "react";

/** Returns a Date that refreshes on a fixed interval so components depending
 *  on "current time" (e.g. event past/in-progress status) re-render without a
 *  page reload. Default 60s — pass shorter values sparingly. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
