"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function RestartButton({ jobPath }: { jobPath: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch("/api/jenkins/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPath }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        status === "success"
          ? "bg-green-100 text-green-800"
          : status === "error"
            ? "bg-red-100 text-red-800"
            : status === "loading"
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : "bg-gray-900 text-white hover:bg-gray-700"
      }`}
    >
      {status === "loading"
        ? "Triggering..."
        : status === "success"
          ? "Triggered!"
          : status === "error"
            ? "Failed"
            : "Restart Checks"}
    </button>
  );
}
