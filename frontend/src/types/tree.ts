// ─── Core domain types ────────────────────────────────────────────────────────

/**
 * A node in the tag tree.
 * Each node has a `name`, and EITHER `children` (array of TagNode) OR `data`
 * (string), never both simultaneously.
 */
export interface TagNode {
  name: string;
  children?: TagNode[];
  data?: string;
}

/**
 * Runtime representation of a TagNode with extra UI state fields.
 * These fields are stripped out during export / API calls.
 */
export interface TagNodeUI extends TagNode {
  /** Unique ID used as React key; not exported to the API. */
  _id: string;
  /** Whether the node's children/data section is collapsed. */
  _collapsed?: boolean;
  children?: TagNodeUI[];
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface TreeRecord {
  id: number;
  name: string;
  tree_data: TagNode;
  created_at: string;
  updated_at: string;
}

export interface CreateTreePayload {
  name: string;
  tree_data: TagNode;
}

export interface UpdateTreePayload {
  name?: string;
  tree_data: TagNode;
}
