/**
 * The purpose of the functions within the script, is do extract tree properties from nodeData objects (
 * hierachical object tree of node information)(obtainable from tree export for example, contained within a frame object aswell). 
 * This is an alternative to requesting these properties from a BTree Implementation directly, and could be used, to calculate
 * properties for sub-trees aswell. 
 */

/**
 * @returns {number} of nodes within the nodeData
 */
export function countNodes(nodeData) {
  let nodeCount = 0;
  if (nodeData.hasOwnProperty("name")) {
    if (nodeData.name.keys.length > 0) {
      nodeCount++;
    }
    if (nodeData.hasOwnProperty("children")) {
      for (let i = 0; i < nodeData.children.length; i++) {
        nodeCount += countNodes(nodeData.children[i]);
      }
    }
    return nodeCount;
  }
}

/**
 * @returns {number} of keys within all the nodes.
 */
export function countKeys(nodeData) {
  let keyCount = 0;
  if (nodeData.hasOwnProperty("name")) {
    if (nodeData.name.keys) {
      keyCount += nodeData.name.keys.length;
    }
    if (nodeData.hasOwnProperty("children")) {
      for (let i = 0; i < nodeData.children.length; i++) {
        keyCount += countKeys(nodeData.children[i]);
      }
    }
  }
  return keyCount;
}

/**
 * @returns {number} height of the tree of node data.
 */
export function countHeight(nodeData) {
    let maxHeight = 0;
      if (nodeData.hasOwnProperty("children")) {
        
        for (let i = 0; i < nodeData.children.length; i++) {
         let height = countHeight(nodeData.children[i]);
         maxHeight = Math.max(height +1, maxHeight)
        }
    }
    return maxHeight
  }
