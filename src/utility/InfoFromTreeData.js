import { height } from "@mui/system";

export function countNodes(treeData) {
  let nodeCount = 0;
  if (treeData.hasOwnProperty("name")) {
    if (treeData.name.keys.length > 0) {
      nodeCount++;
    }
    if (treeData.hasOwnProperty("children")) {
      for (let i = 0; i < treeData.children.length; i++) {
        nodeCount += countNodes(treeData.children[i]);
      }
    }
    return nodeCount;
  }
}

export function countKeys(treeData) {
  let keyCount = 0;
  if (treeData.hasOwnProperty("name")) {
    if (treeData.name.keys) {
      keyCount += treeData.name.keys.length;
    }
    if (treeData.hasOwnProperty("children")) {
      for (let i = 0; i < treeData.children.length; i++) {
        keyCount += countKeys(treeData.children[i]);
      }
    }
  }
  return keyCount;
}

export function countHeight(treeData) {
    let maxHeight = 0;
      if (treeData.hasOwnProperty("children")) {
        
        for (let i = 0; i < treeData.children.length; i++) {
         let height = countHeight(treeData.children[i]);
         maxHeight = Math.max(height +1, maxHeight)
        }
    }
    return maxHeight
  }
