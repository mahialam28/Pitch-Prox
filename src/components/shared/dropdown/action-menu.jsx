"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

// Row / card "more" menu from the design. Rendered in a portal with fixed
// positioning so it is not clipped by scrolling tables.
// items: [{ label, icon, onClick, danger, disabled }] — use { divider: true } for a separator.

const MENU_WIDTH = 220;

// heading: optional small caption above the items; item.tone: classes for a coloured icon tile
const ActionMenu = ({ items, label = "More actions", trigger, triggerClassName = "", width = MENU_WIDTH, heading }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const place = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const opensUp = rect.bottom + menuHeight + 8 > window.innerHeight && rect.top > menuHeight + 8;
    setPosition({
      top: opensUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (menuRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={triggerClassName || "p-2 rounded-xl text-light-black hover:text-dark-black hover:bg-light-gray transition cursor-pointer"}
      >
        {trigger ?? <MoreHorizontal className="w-4 h-4" />}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999, width }}
            className="fixed z-1000 bg-white rounded-xl p-2 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col gap-0.5 font-secondary"
            onClick={(event) => event.stopPropagation()}
          >
            {heading && <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-light-black">{heading}</p>}
            {items.filter(Boolean).map((item, index) =>
              item.divider ? (
                <div key={`divider-${index}`} className="h-px bg-gray-200 my-0.5" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.danger ? "text-red-600 hover:bg-red-50" : "text-dark-black hover:bg-light-gray"
                  }`}
                >
                  {item.icon &&
                    (item.tone ? (
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.tone}`}>
                        <item.icon className="w-4 h-4" />
                      </span>
                    ) : (
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                    ))}
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
