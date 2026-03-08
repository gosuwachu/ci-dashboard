export type StatusState = "success" | "failure" | "pending" | "error";

export interface CommitStatus {
  context: string;
  state: StatusState;
  description: string;
  target_url: string | null;
  created_at: string;
}

export interface ParsedStatus extends CommitStatus {
  platform: string;
  step: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  avatar_url: string;
  date: string;
  status: StatusState | null;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  avatar_url: string;
  branch: string;
  head_sha: string;
  status: StatusState | null;
  updated_at: string;
}

export interface GroupedStatuses {
  ios: ParsedStatus[];
  android: ParsedStatus[];
  other: CommitStatus[];
}
