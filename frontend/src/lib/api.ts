import {
  TreeRecord,
  CreateTreePayload,
  UpdateTreePayload,
} from "@/types/tree";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getAllTrees: () => request<TreeRecord[]>("/trees"),

  getTree: (id: number) => request<TreeRecord>(`/trees/${id}`),

  createTree: (payload: CreateTreePayload) =>
    request<TreeRecord>("/trees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTree: (id: number, payload: UpdateTreePayload) =>
    request<TreeRecord>(`/trees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTree: (id: number) =>
    request<void>(`/trees/${id}`, { method: "DELETE" }),
};
