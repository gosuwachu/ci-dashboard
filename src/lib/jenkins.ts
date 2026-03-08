function getConfig() {
  return {
    url: process.env.JENKINS_URL || "http://localhost:8080",
    user: process.env.JENKINS_USER || "admin",
    pass: process.env.JENKINS_PASS || "admin",
  };
}

export function toJobPath(path: string): string {
  return path
    .split("/")
    .map((s) => `job/${s}`)
    .join("/");
}

export function toBuildUrl(job: string, build: string): string {
  const { url } = getConfig();
  return `${url}/${toJobPath(job)}/${build}/`;
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

export async function triggerBuild(path: string, params?: Record<string, string>) {
  const { url } = getConfig();
  const jobPath = toJobPath(path);
  const { crumbField, crumb, cookies } = await fetchCrumb();
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const res = await fetch(`${url}/${jobPath}/buildWithParameters${query}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      [crumbField]: crumb,
      Cookie: cookies,
    },
  });
  if (!res.ok) throw new Error(`Jenkins trigger: ${res.status}`);
}

export async function fetchBuildParams(buildUrl: string): Promise<Record<string, string>> {
  const res = await fetch(
    `${buildUrl.replace(/\/$/, "")}/api/json?tree=actions[parameters[name,value]]`,
    { headers: { Authorization: authHeader() } }
  );
  if (!res.ok) throw new Error(`Jenkins build params: ${res.status}`);
  const data = await res.json();
  const params: Record<string, string> = {};
  for (const action of data.actions || []) {
    for (const p of action.parameters || []) {
      if (p.name && p.value !== undefined) {
        params[p.name] = p.value;
      }
    }
  }
  return params;
}

export async function fetchConsoleOutput(buildUrl: string, lines: number = 200): Promise<string> {
  const res = await fetch(
    `${buildUrl.replace(/\/$/, "")}/consoleText`,
    { headers: { Authorization: authHeader() } }
  );
  if (!res.ok) throw new Error(`Jenkins console: ${res.status}`);
  const text = await res.text();
  const allLines = text.split("\n");
  return allLines.slice(-lines).join("\n");
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
