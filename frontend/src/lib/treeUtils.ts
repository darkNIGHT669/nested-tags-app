import { TagNode, TagNodeUI } from "@/types/tree";

let _counter = 0;
function uid(): string {
  return `tag_${Date.now()}_${_counter++}`;
}

/** Convert a plain TagNode (from API) into a TagNodeUI with runtime _id fields */
export function toUI(node: TagNode): TagNodeUI {
  const base: TagNodeUI = {
    ...node,
    _id: uid(),
    _collapsed: false,
  };
  if (node.children) {
    base.children = node.children.map(toUI);
  }
  return base;
}

/** Strip runtime UI fields (_id, _collapsed) before sending to the API */
export function toPlain(node: TagNodeUI): TagNode {
  const plain: TagNode = { name: node.name };
  if (node.children !== undefined) {
    plain.children = node.children.map(toPlain);
  } else if (node.data !== undefined) {
    plain.data = node.data;
  }
  return plain;
}

/** Recursively update a node by _id */
export function updateNode(
  root: TagNodeUI,
  id: string,
  updater: (node: TagNodeUI) => TagNodeUI
): TagNodeUI {
  if (root._id === id) return updater(root);
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((c) => updateNode(c, id, updater)),
  };
}

/** Create a fresh "New Child" leaf node */
export function newChildNode(): TagNodeUI {
  return {
    _id: uid(),
    _collapsed: false,
    name: "New Child",
    data: "Data",
  };
}

/** Default tree shown when no saved trees exist */
export function defaultTree(): TagNodeUI {
  return toUI({
    name: "root",
    children: [
      {
        name: "child1",
        children: [
          { name: "child1-child1", data: "c1-c1 Hello" },
          { name: "child1-child2", data: "c1-c2 JS" },
        ],
      },
      { name: "child2", data: "c2 World" },
    ],
  });
}
