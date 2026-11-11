"use client";

import { useEffect } from "react";

// Phones: wide tables scroll sideways inside their card, but nothing showed that more columns
// were there (client's mobile list: "squeezed tables"). This marks every scrollable table container:
//   data-scroll-table        → the first column stays pinned while swiping (globals.css)
//   data-more="right|left|both" → a fade on the edge(s) that still have columns behind them
// Works on every page without changing each table.
const isScroller = (element) => {
  const style = getComputedStyle(element);
  return (style.overflowX === "auto" || style.overflowX === "scroll") && element.scrollWidth > element.clientWidth + 2;
};

function update(element) {
  const left = element.scrollLeft > 2;
  const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
  const more = left && right ? "both" : right ? "right" : left ? "left" : "";
  if (element.dataset.more !== more) element.dataset.more = more;
}

export default function TableScrollHints() {
  useEffect(() => {
    const tracked = new Set();
    const scan = () => {
      for (const table of document.querySelectorAll("table")) {
        for (let parent = table.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
          if (!isScroller(parent)) continue;
          if (!tracked.has(parent)) {
            tracked.add(parent);
            parent.dataset.scrollTable = "";
            parent.addEventListener("scroll", () => update(parent), { passive: true });
          }
          update(parent);
          break;
        }
      }
    };
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    scan();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return null;
}
