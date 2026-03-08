"use client";

export default function AuthorLink({ login, name }: { login: string | null; name: string }) {
  if (!login) return <span>{name}</span>;
  return (
    <a
      href={`https://github.com/${login}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 hover:underline"
    >
      {name || login}
    </a>
  );
}
