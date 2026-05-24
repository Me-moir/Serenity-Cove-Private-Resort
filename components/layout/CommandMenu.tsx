"use client";

import { useState } from "react";
import { Search } from "react-bootstrap-icons";

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex w-full items-center justify-between rounded-full bg-topbar px-4 py-2 text-xs text-text-on-dark"
      aria-label="Open command menu"
    >
      <span className="flex items-center gap-2">
        <Search size={14} />
        <span className="hidden md:group-hover:inline lg:inline text-text-on-dark/70">
          Find
        </span>
      </span>
      <kbd className="hidden md:group-hover:inline-flex lg:inline-flex rounded-full border border-white/30 px-2 py-0.5 text-[10px] tracking-[0.2em]">
        ⌘K
      </kbd>
    </button>
  );
}
