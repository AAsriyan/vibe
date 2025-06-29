import { TreeItem } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFilesToTreeItems = (files: {
  [path: string]: string;
}): TreeItem[] => {
  interface TreeNode {
    [key: string]: TreeNode | null;
  }
  const tree: TreeNode = {};

  const sortedPaths = Object.keys(files).sort();

  for (const path of sortedPaths) {
    const parts = path.split("/");
    let currentNode: TreeNode = tree;

    for (const part of parts) {
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part] as TreeNode;
    }

    const fileName = parts[parts.length - 1];
    currentNode[fileName] = null;
  }

  const convertNode = (
    node: TreeNode,
    name?: string
  ): TreeItem[] | TreeItem => {
    const entries = Object.entries(node);

    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // This is a file
        children.push(key);
      } else {
        // This is a directory
        const subTree = convertNode(value as TreeNode, key);

        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  };

  const result = convertNode(tree);

  return Array.isArray(result) ? result : [result];
};
