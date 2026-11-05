"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils.js/cn";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const TOOLTIP_GAP = 10; // px between trigger and bubble
const VIEWPORT_PAD = 8; // min px kept between the bubble and the viewport edge

/**
 * Reusable professional tooltip — wraps a trigger (icon/button) and shows a
 * structured bubble on hover/focus:
 *
 *   ┌─────────────────────────────────┐
 *   │ ●  Objection Analysis           │  ← optional title header + accent dot
 *   │ ─────────────────────────────── │  ← divider
 *   │  Breaks down the objections...  │  ← description body
 *   └─────────────────────────────────┘
 *
 * The bubble is rendered through a portal at <body> level with fixed
 * positioning, so it can never be clipped by an ancestor that has
 * overflow:hidden / overflow:auto (e.g. modals with rounded corners, scroll
 * areas). It is clamped to the viewport and hidden on scroll/resize so it
 * never sits detached from its trigger.
 *
 * Props:
 *  - title     : optional bold header shown above the description
 *  - text      : the tooltip copy
 *  - children  : the trigger element
 *  - position  : "top" (default) | "bottom" — which side of the trigger the bubble sits on
 *  - align     : "center" (default) | "start" | "end" — horizontal alignment of bubble vs trigger
 *  - maxWidth  : bubble max width in px (default 280)
 *  - className : extra classes for the wrapper
 */
const Tooltip = ({
  title,
  text,
  children,
  position = "top",
  align = "center",
  maxWidth = 280,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, arrowLeft: 0, side: null });
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  // Small show delay + near-instant hide keeps the tooltip from flashing while
  // the pointer travels across adjacent triggers.
  const handleEnter = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), 120);
  };
  const handleLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 80);
  };

  // Position the bubble relative to the trigger every time it becomes
  // visible. useIsomorphicLayoutEffect runs before the browser paints on the client,
  // so the bubble never flashes at a stale spot.
  useIsomorphicLayoutEffect(() => {
    if (!visible) return;
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const tr = trigger.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    const bw = br.width;
    const bh = br.height;

    // Pick the side that fits; fall back to the opposite side when the
    // requested one doesn't have enough room, so the bubble never covers the
    // trigger (e.g. a tall bubble near the top of a modal).
    const spaceAbove = tr.top - VIEWPORT_PAD;
    const spaceBelow = window.innerHeight - tr.bottom - VIEWPORT_PAD;
    let side = position;
    if (side === "top" && bh + TOOLTIP_GAP > spaceAbove && spaceBelow >= bh + TOOLTIP_GAP) {
      side = "bottom";
    } else if (side === "bottom" && bh + TOOLTIP_GAP > spaceBelow && spaceAbove >= bh + TOOLTIP_GAP) {
      side = "top";
    }

    let top = side === "top" ? tr.top - TOOLTIP_GAP - bh : tr.bottom + TOOLTIP_GAP;
    let left;
    if (align === "start") {
      left = tr.left;
    } else if (align === "end") {
      left = tr.right - bw;
    } else {
      left = tr.left + tr.width / 2 - bw / 2;
    }

    // Clamp so the bubble stays fully inside the viewport (nothing else can
    // clip it now that it renders in a portal).
    top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - VIEWPORT_PAD - bh));
    left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - VIEWPORT_PAD - bw));

    // Arrow points at the trigger's horizontal center (kept within the bubble).
    const arrowLeft = Math.min(Math.max(tr.left + tr.width / 2 - left, 12), bw - 12);

    setPos({ top, left, arrowLeft, side });
  }, [visible, position, align, text, title]);

  // Hide (and re-measure next time) once the user scrolls or resizes, so the
  // fixed bubble never sits detached from its trigger.
  const handleViewportChange = useCallback(() => {
    clearTimeout(showTimer.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [visible, handleViewportChange]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(
          "relative inline-flex cursor-pointer rounded-full p-1 -m-1 transition-all duration-200 hover:bg-light-teal/70 active:scale-90",
          className
        )}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {children}
      </span>

      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.span
              ref={bubbleRef}
              role="tooltip"
              initial={{ opacity: 0, y: (pos.side || position) === "top" ? 8 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: (pos.side || position) === "top" ? 4 : -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                maxWidth,
                zIndex: 99999,
                pointerEvents: "none",
              }}
              className="w-max"
            >
              {/* Arrow */}
              <span
                className={cn(
                  "absolute w-2.5 h-2.5 rotate-45 bg-dark-teal",
                  (pos.side || position) === "top" ? "-bottom-1.5" : "-top-1.5"
                )}
                style={{ left: pos.arrowLeft }}
              />
              {/* Bubble */}
              <span className="block overflow-hidden rounded-xl bg-gradient-to-b from-[#2A6378] to-dark-teal text-left shadow-[0_16px_40px_-12px_rgba(20,60,72,0.6)] ring-1 ring-white/10">
                {title && (
                  <>
                    <span className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_rgba(14,173,171,0.85)]" />
                      <span className="text-xs font-bold tracking-wide text-white">
                        {title}
                      </span>
                    </span>
                    <span className="mx-4 block h-px bg-white/10" />
                  </>
                )}
                <span className="block px-4 py-2.5 text-[11px] sm:text-xs font-medium leading-relaxed text-white/85">
                  {text}
                </span>
              </span>
            </motion.span>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
