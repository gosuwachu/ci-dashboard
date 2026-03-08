"use client";

import { OWNER, REPO } from "@/lib/constants";

export default function CommitLink({ sha }: { sha: string }) {
  return (
    <a
      href={`https://github.com/${OWNER}/${REPO}/commit/${sha}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
    >
      {sha.slice(0, 7)}
    </a>
  );
}
