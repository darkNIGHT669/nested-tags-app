"use client";

import React, { useState, useRef, useEffect } from "react";
import { TagNodeUI } from "@/types/tree";
import { updateNode, newChildNode } from "@/lib/treeUtils";

interface TagViewProps {
  node: TagNodeUI;
  depth?: number;
  onUpdate: (updated: TagNodeUI) => void;
}

// Depth-based left border accent colors
const DEPTH_ACCENTS = [
  "border-blue-600",
  "border-indigo-500",
  "border-violet-500",
  "border-purple-500",
  "border-fuchsia-500",
  "border-pink-500",
];

const DEPTH_HEADER_BG = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-purple-600",
  "bg-fuchsia-600",
  "bg-pink-600",
];

export default function TagView({ node, depth = 0, onUpdate }: TagViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(node.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const accentBorder = DEPTH_ACCENTS[depth % DEPTH_ACCENTS.length];
  const headerBg = DEPTH_HEADER_BG[depth % DEPTH_HEADER_BG.length];
  const isCollapsed = node._collapsed ?? false;

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleToggleCollapse() {
    onUpdate({ ...node, _collapsed: !isCollapsed });
  }

  function handleAddChild() {
    const child = newChildNode();
    // Replace `data` with `children` array containing the new child
    const updated: TagNodeUI = {
      ...node,
      data: undefined,
      children: node.children ? [...node.children, child] : [child],
    };
    onUpdate(updated);
  }

  function handleDataChange(value: string) {
    onUpdate({ ...node, data: value });
  }

  function handleChildUpdate(childId: string, updatedChild: TagNodeUI) {
    if (!node.children) return;
    onUpdate({
      ...node,
      children: node.children.map((c) =>
        c._id === childId ? updatedChild : c
      ),
    });
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onUpdate({ ...node, name: draftName.trim() || node.name });
      setEditingName(false);
    }
    if (e.key === "Escape") {
      setDraftName(node.name);
      setEditingName(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={`border-l-4 ${accentBorder} rounded-lg overflow-hidden shadow-md mb-3 animate-fade-in`}
      style={{ marginLeft: depth > 0 ? "0" : "0" }}
    >
      {/* Header */}
      <div
        className={`${headerBg} flex items-center gap-2 px-3 py-2 select-none`}
      >
        {/* Collapse toggle */}
        <button
          onClick={handleToggleCollapse}
          className="text-white/80 hover:text-white w-5 h-5 flex items-center justify-center rounded text-xs font-bold transition-colors hover:bg-white/10"
          title={isCollapsed ? "Expand" : "Collapse"}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "›" : "⌄"}
        </button>

        {/* Name / editable name */}
        {editingName ? (
          <input
            ref={nameInputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={() => {
              onUpdate({ ...node, name: draftName.trim() || node.name });
              setEditingName(false);
            }}
            className="flex-1 bg-white/20 text-white placeholder-white/50 rounded px-2 py-0.5 text-sm font-mono focus:outline-none focus:bg-white/30 border border-white/40"
          />
        ) : (
          <span
            className="flex-1 text-white font-mono text-sm font-semibold cursor-pointer hover:underline decoration-white/50 underline-offset-2 truncate"
            onClick={() => {
              setDraftName(node.name);
              setEditingName(true);
            }}
            title="Click to rename"
          >
            {node.name}
          </span>
        )}

        {/* Add Child button */}
        <button
          onClick={handleAddChild}
          className="ml-auto text-xs bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 font-medium transition-colors whitespace-nowrap border border-white/20"
        >
          + Add Child
        </button>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="bg-slate-800/60 backdrop-blur-sm px-3 py-3 space-y-3">
          {/* Data field */}
          {node.data !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-mono shrink-0">
                data:
              </span>
              <input
                type="text"
                value={node.data}
                onChange={(e) => handleDataChange(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors"
                placeholder="Enter data…"
              />
            </div>
          )}

          {/* Children */}
          {node.children && node.children.length > 0 && (
            <div className="space-y-2 pl-3 border-l border-slate-600/50">
              {node.children.map((child) => (
                <TagView
                  key={child._id}
                  node={child}
                  depth={depth + 1}
                  onUpdate={(updated) => handleChildUpdate(child._id, updated)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!node.data && (!node.children || node.children.length === 0) && (
            <p className="text-slate-500 text-xs italic font-mono">
              No content — click &quot;+ Add Child&quot; to add a child node.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
