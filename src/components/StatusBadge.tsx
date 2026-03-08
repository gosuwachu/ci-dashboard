"use client";

import type { StatusState } from "@/lib/types";

const styles: Record<StatusState | "none", { bg: string; text: string; label: string }> = {
  success: { bg: "bg-green-100", text: "text-green-800", label: "Passed" },
  failure: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  error: { bg: "bg-red-100", text: "text-red-800", label: "Error" },
  none: { bg: "bg-gray-100", text: "text-gray-500", label: "No status" },
};

export default function StatusBadge({
  state,
  label,
}: {
  state: StatusState | null;
  label?: string;
}) {
  const s = (state && styles[state]) ?? styles.none;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          state === "success"
            ? "bg-green-500"
            : state === "failure" || state === "error"
              ? "bg-red-500"
              : state === "pending"
                ? "bg-yellow-500"
                : "bg-gray-400"
        }`}
      />
      {label ?? s.label}
    </span>
  );
}
