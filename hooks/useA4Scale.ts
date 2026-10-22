"use client";

import { useEffect, useRef, useState } from "react";

/** Scale factor so a fixed-width A4 page fits inside its container. */
export function useA4Scale(pageWidthPx: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth;
      if (available > 0) setScale(Math.min(available / pageWidthPx, 1));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageWidthPx]);

  return { containerRef, scale };
}
