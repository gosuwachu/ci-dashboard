"use client";

export default function AppSelector() {
  return (
    <select
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700"
      defaultValue="mobile-app"
    >
      <option value="mobile-app">Mobile App</option>
    </select>
  );
}
