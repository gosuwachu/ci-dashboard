import { OWNER, REPO } from "./constants";

const BASE = "https://api.github.com";

function headers(): HeadersInit {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("GH_TOKEN environment variable is not set");
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
  };
}

export async function fetchCommits(sha: string, perPage = 20) {
  const url = `${BASE}/repos/${OWNER}/${REPO}/commits?sha=${sha}&per_page=${perPage}`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub commits: ${res.status}`);
  return res.json();
}

export async function fetchCombinedStatus(sha: string) {
  const url = `${BASE}/repos/${OWNER}/${REPO}/commits/${sha}/status`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub combined status: ${res.status}`);
  return res.json();
}

export async function fetchStatuses(sha: string) {
  const url = `${BASE}/repos/${OWNER}/${REPO}/commits/${sha}/statuses?per_page=100`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub statuses: ${res.status}`);
  return res.json();
}

export async function fetchPulls(state = "open") {
  const url = `${BASE}/repos/${OWNER}/${REPO}/pulls?state=${state}&sort=updated&direction=desc&per_page=20`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub pulls: ${res.status}`);
  return res.json();
}

export async function fetchPull(number: number) {
  const url = `${BASE}/repos/${OWNER}/${REPO}/pulls/${number}`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub pull: ${res.status}`);
  return res.json();
}
