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

function authHeader(): string {
  const { user, pass } = getConfig();
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

async function fetchCrumb(): Promise<{ crumbField: string; crumb: string; cookies: string }> {
  const { url } = getConfig();
  const res = await fetch(`${url}/crumbIssuer/api/json`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Jenkins crumb: ${res.status}`);
  const data = await res.json();
  const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return { crumbField: data.crumbRequestField, crumb: data.crumb, cookies };
}

export async function triggerBuild(path: string) {
  const { url } = getConfig();
  const jobPath = toJobPath(path);
  const { crumbField, crumb, cookies } = await fetchCrumb();
  const res = await fetch(`${url}/${jobPath}/buildWithParameters`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      [crumbField]: crumb,
      Cookie: cookies,
    },
  });
  if (!res.ok) throw new Error(`Jenkins trigger: ${res.status}`);
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
