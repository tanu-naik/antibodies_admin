"use client";

import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  className?: string;
  maxLines?: number;
}

export default function ExpandableText({ text, className = "", maxLines = 3 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return <span className={className}>—</span>;

  return (
    <div className="group/expand">
      <span
        className={`block text-xs text-slate-600 leading-snug ${
          expanded ? "" : `line-clamp-${maxLines}`
        } ${className}`}
      >
        {text}
      </span>
      {text.length > 80 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-0.5 text-[10px] font-medium text-brand-green hover:text-brand-navy transition-colors"
        >
          {expanded ? "Show less" : "...more"}
        </button>
      )}
    </div>
  );
}
