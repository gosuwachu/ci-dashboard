function getConfig() {
  return {
    url: process.env.JENKINS_URL || "http://localhost:8080",
    user: process.env.JENKINS_USER || "admin",
    pass: process.env.JENKINS_PASS || "admin",
  };
}

function toJobPath(path: string): string {
  return path
    .split("/")
    .map((s) => `job/${s}`)
    .join("/");
}

export async function fetchJobInfo(path: string, tree?: string) {
  const { url, user, pass } = getConfig();
  const jobPath = toJobPath(path);
  const query = tree ? `?tree=${encodeURIComponent(tree)}` : "";
  const res = await fetch(`${url}/${jobPath}/api/json${query}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Jenkins API: ${res.status}`);
  return res.json();
}
