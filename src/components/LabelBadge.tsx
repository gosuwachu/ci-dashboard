"use client";

import type { Label } from "@/lib/types";

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Perceived brightness (sRGB luma)
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 128 ? "#000000" : "#ffffff";
}

export default function LabelBadge({ label }: { label: Label }) {
  const bg = `#${label.color}`;
  const fg = contrastColor(label.color);
  const border = `#${label.color}80`;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-tight"
      style={{ backgroundColor: bg, color: fg, border: `1px solid ${border}` }}
    >
      {label.name}
    </span>
  );
}
