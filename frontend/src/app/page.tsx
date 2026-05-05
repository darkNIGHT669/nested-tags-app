"use client";

import React, { useEffect, useState } from "react";
import { TreeRecord } from "@/types/tree";
import { TagNodeUI } from "@/types/tree";
import { api } from "@/lib/api";
import { toUI, defaultTree } from "@/lib/treeUtils";
import TreeEditor from "@/components/TreeEditor";

interface TreeEditorEntry {
  key: string; // stable React key
  record: TreeRecord | null;
  tree: TagNodeUI;
}

export default function HomePage() {
  const [entries, setEntries] = useState<TreeEditorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrees() {
      try {
        const records = await api.getAllTrees();
        if (records.length === 0) {
          // Seed with the default example tree
          setEntries([
            {
              key: "default",
              record: null,
              tree: defaultTree(),
            },
          ]);
        } else {
          setEntries(
            records.map((r) => ({
              key: `record-${r.id}`,
              record: r,
              tree: toUI(r.tree_data),
            }))
          );
        }
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Failed to connect to backend."
        );
        // Still show the default tree so the UI is usable offline
        setEntries([
          {
            key: "default",
            record: null,
            tree: defaultTree(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadTrees();
  }, []);

  function handleSaved(entry: TreeEditorEntry, record: TreeRecord) {
    setEntries((prev) =>
      prev.map((e) =>
        e.key === entry.key ? { ...e, record, key: `record-${record.id}` } : e
      )
    );
  }

  function handleDeleted(id: number) {
    setEntries((prev) => prev.filter((e) => e.record?.id !== id));
  }

  function handleAddNewTree() {
    setEntries((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        record: null,
        tree: defaultTree(),
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-blue-400 font-bold text-lg tracking-tight">
              nested-tags-tree
            </span>
            <span className="text-slate-600 font-mono text-sm">v1.0</span>
          </div>
          <button
            onClick={handleAddNewTree}
            className="text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-3 py-1.5 transition-colors border border-slate-600 flex items-center gap-1.5"
          >
            <span className="text-blue-400">+</span> New Tree
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* API warning banner */}
        {apiError && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-3 text-yellow-300 text-sm font-mono flex items-start gap-3">
            <span className="text-yellow-500 text-lg leading-none mt-0.5">⚠</span>
            <div>
              <p className="font-semibold">Backend not reachable</p>
              <p className="text-yellow-400 text-xs mt-0.5">{apiError}</p>
              <p className="text-yellow-500 text-xs mt-1">
                Showing demo tree. Start the FastAPI server on{" "}
                <code className="bg-yellow-900/50 px-1 rounded">
                  {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
                </code>{" "}
                to persist changes.
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-800 rounded-xl animate-pulse border border-slate-700"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-5xl mb-4">🌳</p>
            <p className="font-mono text-lg">No trees yet.</p>
            <p className="text-sm mt-2">Click &quot;+ New Tree&quot; to get started.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <TreeEditor
              key={entry.key}
              record={entry.record}
              initialTree={entry.tree}
              onSaved={(record) => handleSaved(entry, record)}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-6 text-center">
        <p className="text-slate-600 text-xs font-mono">
          AIMonk Full Stack Assignment · Next.js + FastAPI + PostgreSQL
        </p>
      </footer>
    </div>
  );
}
