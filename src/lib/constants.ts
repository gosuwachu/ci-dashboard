export const OWNER = "gosuwachu";
export const REPO = "mobile-app";

export const PLATFORMS = ["ios", "android"] as const;

export const STEPS = [
  "build",
  "unit-tests",
  "linter",
  "deploy",
  "ui-tests",
  "alpha-build",
  "production-build",
] as const;

export const POLLING_INTERVAL = 30_000;

export function parseContext(context: string): { platform: string; step: string } | null {
  const match = context.match(/^ci\/(ios|android)-(.+)$/);
  if (!match) return null;
  return { platform: match[1], step: match[2] };
}

export function stepDisplayName(step: string): string {
  return step
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
