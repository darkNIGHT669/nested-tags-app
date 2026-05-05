"use client";

import React, { useState } from "react";
import { TagNodeUI } from "@/types/tree";
import { TreeRecord } from "@/types/tree";
import { toPlain } from "@/lib/treeUtils";
import { api } from "@/lib/api";
import TagView from "./TagView";

interface TreeEditorProps {
  record: TreeRecord | null; // null = unsaved new tree
  initialTree: TagNodeUI;
  onSaved: (record: TreeRecord) => void;
  onDeleted?: (id: number) => void;
}

export default function TreeEditor({
  record,
  initialTree,
  onSaved,
  onDeleted,
}: TreeEditorProps) {
  const [tree, setTree] = useState<TagNodeUI>(initialTree);
  const [exportJson, setExportJson] = useState<string>("");
  const [showExport, setShowExport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleExport() {
    const plain = toPlain(tree);
    const json = JSON.stringify(plain, null, 2);
    setExportJson(json);
    setShowExport(true);

    setSaving(true);
    setSaveStatus("idle");
    setErrorMsg("");

    try {
      if (record) {
        // Update existing
        const updated = await api.updateTree(record.id, {
          name: record.name,
          tree_data: plain,
        });
        onSaved(updated);
      } else {
        // Create new
        const created = await api.createTree({
          name: plain.name,
          tree_data: plain,
        });
        onSaved(created);
      }
      setSaveStatus("ok");
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!record || !onDeleted) return;
    if (!confirm(`Delete tree "${record.name}"?`)) return;
    try {
      await api.deleteTree(record.id);
      onDeleted(record.id);
    } catch (err) {
      alert("Failed to delete: " + (err instanceof Error ? err.message : err));
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_2px_rgba(59,130,246,0.5)]" />
          <span className="font-mono text-slate-200 text-sm font-semibold">
            {record ? `Tree #${record.id} — ${record.name}` : "New Tree (unsaved)"}
          </span>
          {record && (
            <span className="text-slate-500 text-xs">
              {new Date(record.updated_at).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {record && onDeleted && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 rounded px-2 py-1 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={saving}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded px-3 py-1.5 transition-colors flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <span className="animate-spin inline-block">⟳</span> Saving…
              </>
            ) : (
              <>⬆ Export & Save</>
            )}
          </button>
        </div>
      </div>

      {/* Save status banner */}
      {saveStatus === "ok" && (
        <div className="bg-green-900/40 border-b border-green-700 px-4 py-1.5 text-green-400 text-xs font-mono flex items-center gap-2">
          <span>✓</span>
          {record ? "Tree updated in database." : "Tree saved to database."}
        </div>
      )}
      {saveStatus === "error" && (
        <div className="bg-red-900/40 border-b border-red-700 px-4 py-1.5 text-red-400 text-xs font-mono flex items-center gap-2">
          <span>✗</span>
          {errorMsg || "Failed to save."}
          <span className="text-red-500 ml-1">
            (Is the backend running on{" "}
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}?)
          </span>
        </div>
      )}

      {/* Tree */}
      <div className="p-4">
        <TagView
          node={tree}
          depth={0}
          onUpdate={(updated) => setTree(updated)}
        />
      </div>

      {/* JSON Export panel */}
      {showExport && (
        <div className="border-t border-slate-700">
          <div className="flex items-center justify-between bg-slate-800/50 px-4 py-2">
            <span className="text-slate-400 text-xs font-mono">
              Exported JSON
            </span>
            <button
              onClick={() => setShowExport(false)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕ Close
            </button>
          </div>
          <pre className="bg-slate-950 text-green-400 text-xs font-mono p-4 overflow-x-auto max-h-64 leading-relaxed">
            {exportJson}
          </pre>
        </div>
      )}
    </div>
  );
}
