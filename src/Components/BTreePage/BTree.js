#!/usr/bin/env node

/**
 * B-Tree Implementation, tailored to fit the requirements of the Tree Visualizer Webapplication.
 * 
 * Original code source: https://gist.github.com/marcin-chwedczuk/105b9e2c99e3ba48d4e1cd51f2a35907
 * Original author: Marcin Chwedczuk
 * Modified by: Matteo Glaeser
 * 
 * Permission to use this code was acquired from the original author.
 */


// libraries
import _ from "lodash";

// scripts
import HighlightData from "./BTreePlot/HighlightData";


// ---------- UTILITY FUNCTIONS ----------

/**
 * Creates an array of the specified size filled with null.
 *
 * @param size - The size of the array. Must be greater than zero.
 *
 * @return { Array } An array of the specified size filled with null
 */
function arrayOfSize(size) {
  return Array.from({ length: size }, () => null);
}

/**
 * Pushes a frame to the tree's frameBuffer. frames are objects, capsuling a state of a b-tree with all information required to render it.
 *
 * @param tree - Reference to the tree object that should produce the frame.
 * @param highlightData - Highlight Object, containing info on which highlights should be applied
 */
function pushTreeFrame(tree, highlightData) {
  if (tree._sequenceMode) {
    tree._frameBufferRef.push({
      // FRAME OBJECT
      nodeData: tree.toNodeData(),
      highlightData: highlightData,
      counters: {
        splits: tree._splitCounter,
        merges: tree._mergeCounter,
        smallRotations: tree._smallRotationCounter,
        bigRotations: tree._bigRotationCounter,
      },
    });
  }
}
/**
 * like the pushTreeFrame function, but may provide a nodeData object. It is not taken from the current state of the tree.
 *
 * @param tree - Reference to the tree that should produce the frame.
 * @param highlightData - highlightData Object, containing info on which highlights should be applied
 * @param nodeData - nodeData Object, it does not need to match with the current state of the tree
 */
function pushTreeFrameCustomData(tree, highlightData, nodeData) {
  if (tree._sequenceMode) {
    tree._frameBufferRef.push({
      // FRAME OBJECT
      nodeData: nodeData,
      highlightData: highlightData,
      counters: {
        splits: tree._splitCounter,
        merges: tree._mergeCounter,
        smallRotations: tree._smallRotationCounter,
        bigRotations: tree._bigRotationCounter,
      },
    });
  }
}

// ---------- BTREE IMPLEMENTATION ----------

/**
 * Creates a new BTreeNode instance.
 *
 * @param tree - The tree to add this node to. Must be a pre - created instance of the BTree class.
 * @param maxKeys - The maximum number of keys each node may store (order - 1 for most B-Tree specifications)
 */
function BTreeNode(tree, maxKeys) {
  this._tree = tree;
  this._tree._idCounter++; //assign a unique node id by incrementing the trees id counter
  this._id = this._tree._idCounter;
  this._maxKeys = maxKeys;
  this._keyCount = 0;
  this._keys = arrayOfSize(this._maxKeys);
  this._children = arrayOfSize(this._maxKeys + 1);
}

/**
 * @return { boolean } True if this node has no children
 */
BTreeNode.prototype.isLeaf = function () {
  return this._children[0] === null;
};

/**
 * @return Whether or not a node is holding the max number of keys
 */
BTreeNode.prototype.isFull = function () {
  return this._keyCount == this._maxKeys;
};

/**
 * @param key - a key you are looking for
 *
 * @return { boolean } True if this node or any of its decendents contain the key
 */
BTreeNode.prototype.contains = function (key) {
  if (this.isLeaf()) {
    return this._keys.indexOf(key) != -1;
  } else {
    for (let i = 0; i < this._keyCount; i++) {
      if (key == this._keys[i]) {
        return true;
      }

      if (key < this._keys[i]) {
        return this._children[i].contains(key);
      }

      if (i == this._keyCount - 1) {
        return this._children[i + 1].contains(key);
      }
    }
    return false;
  }
};

/**
 * @return { Array } An ordered list of all keys, that this node and all of its decendents contain
 */
BTreeNode.prototype.getKeys = function () {
  if (this.isLeaf()) {
    return this._keys.slice(0, this._keyCount);
  } else {
    let keys = this._children[0].getKeys();
    for (let i = 0; i < this._keyCount; i++) {
      keys.push(this._keys[i]);
      keys = keys.concat(this._children[i + 1].getKeys());
    }
    return keys;
  }
};

/**
 * @return { Array } A list containing this node and all of its decendents
 */
BTreeNode.prototype.getNodes = function () {
  if (this.isLeaf()) {
    return [this];
  }
  return [this].concat(
    ...this._children
      .filter((node) => node !== null)
      .map((node) => node.getNodes())
  );
};

/**
 * @param key
 * @param parent
 *
 * @return { Object } The split or null if ther was not overflow
 */
BTreeNode.prototype.add = function (key, parent) {
  if (this.isLeaf()) {
    // If at Leaf level, insert the key, or insert with Split if already full
    if (this.isFull()) {
      return this.split(key, null, null, parent);
    } else {
      this.insertKey(key);
      return null;
    }
  } else {
    // not at leaf level -> redirect to appropriate child
    var child = this.getChildContaining(key);

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(child._id, true, "");
      highlight.addEdgeHighlightFromNodeId(this._id, child._id, true);
      pushTreeFrame(this._tree, highlight);
    }

    //if child did not overflow, split will be null
    var split = child.add(key, this);
    if (!split) {
      return null;
    }

    // child did overflow -> if this is full, overflow again, else insert the split
    if (this.isFull()) {
      return this.split(
        split.key,
        split.right,
        split.nodeDataSnapshot,
        parent,
        split.subTreeHighlightAt
      );
    } else {
      this.insertSplit(split);
      return null;
    }
  }
};

/**
 *
 *
 * @param key - the key, the should be inserted into this node at the correct position
 */
BTreeNode.prototype.insertKey = function (key) {
  var pos = this._keyCount;
  var keys = this._keys;

  let nodeDataSnapshot = this._tree.toNodeData();
  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    if (!this._tree.isEmpty()) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, false, "finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
    }
  }

  //moves keys to make space
  while (pos > 0 && keys[pos - 1] > key) {
    keys[pos] = keys[pos - 1];
    pos--;

    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, false, "finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
    }
  }

  keys[pos] = key;
  this._keyCount += 1;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeIndexHighlight(this._id, pos, "");
    pushTreeFrame(this._tree, highlight);
  }
};

/**
 * Inserts a splitted node (middle key and 2 children) into this node
 * In this Implementation, the child that gets splitted is passed as the left child,
 * it is not reassigned, since it already is at the right place
 *
 * @param split - a split object returned from BTreeNode.prototype.split
 */
BTreeNode.prototype.insertSplit = function (split) {
  // splited child
  var child = split.left;

  var pos = this._keyCount;

  //move key and children to make space
  while (pos > 0 && this._children[pos] !== child) {
    this._keys[pos] = this._keys[pos - 1];
    this._children[pos + 1] = this._children[pos];
    pos--;
  }

  this._keys[pos] = split.key;
  this._children[pos + 1] = split.right;
  this._keyCount += 1;

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    let nodeDataSnapshot = this._tree.toNodeData();
    highlight.addHighlightedSubtree(this._id, [pos], nodeDataSnapshot);
    pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
  }
};

/**
 * @param key - the key/keyposition you you want to find
 *
 * @return { BTreeNode } return the child holding the key range, where key falls in.
 */
BTreeNode.prototype.getChildContaining = function (key) {
  for (var i = this._keyCount; i >= 1; i--) {
    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, false, "finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        i,
        `${key} ${this._keys[i - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrame(this._tree, highlight);
    }

    if (key > this._keys[i - 1]) {
      return this._children[i];
    }
  }
  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeHighlight(this._id, false, "finding position");
    highlight.addNodeSeparatorHighlight(this._id, 0, `${key} ✓`);
    pushTreeFrame(this._tree, highlight);
  }

  return this._children[0];
};

/**
 * Inserts a key that would overflow the node and then performs a split.
 * 
* @param key - key that needs to be inserted
* @param keyRightChild right child from the middle key
* @param nodeDataSnapshot FOR FRAME SEGMENT, contains a snapshot of custom node Data, that should be used instead of the current state.
* @param parent //FOR FRAME SEGMENT, reference to the parent node
* @param subTreeHighlightAt // FOR FRAME SEGMENT, indicates if a subTreeHighlight should be rendered at that index, if no then null
* 
* @return An Object holding the median key, left and right child. for FRAME SEGEMENTS ONLY, also a new nodeDataSnapshot 
          and a new subTreeHighight instruction, if not in Sequence mode these fields are null
*/
BTreeNode.prototype.split = function (
  key,
  keyRightChild,
  nodeDataSnapshot,
  parent,
  subTreeHighlightAt = null
) {
  var left = this;
  var right = new BTreeNode(this._tree, this._maxKeys);

  // temp storage for keys and children
  var keys = this._keys.slice();
  keys.push(null);
  var children = this._children.slice();
  children.push(null);

  // find new key position
  var pos = keys.length - 1;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    if (!subTreeHighlightAt) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, false, "finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );

      pushTreeFrameCustomData(
        this._tree,
        highlight,
        nodeDataSnapshot ? nodeDataSnapshot : this._tree.toNodeData()
      );
    }
  }

  while (pos > 0 && keys[pos - 1] > key) {
    keys[pos] = keys[pos - 1];
    children[pos + 1] = children[pos];
    pos--;

    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      if (!subTreeHighlightAt) {
        let highlight = new HighlightData();
        highlight.addNodeHighlight(this._id, false, "finding position");
        highlight.addNodeSeparatorHighlight(
          this._id,
          pos,
          `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
        );
        pushTreeFrameCustomData(
          this._tree,
          highlight,
          nodeDataSnapshot ? nodeDataSnapshot : this._tree.toNodeData()
        );
      }
    }
  }

  keys[pos] = key;
  children[pos + 1] = keyRightChild;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let prevKeys = this._keys;
    let prevChilds = this._children;
    this._keys = keys;
    this._children = children;
    this._keyCount++;
    let highlight = new HighlightData();
    nodeDataSnapshot = this._tree.toNodeData();
    highlight.addNodeIndexHighlight(this._id, pos, "");
    // Highlights the tree at the given position.
    if (subTreeHighlightAt) {
      highlight.addHighlightedSubtree(this._id, [pos], nodeDataSnapshot);
    }
    pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);

    highlight = new HighlightData();
    highlight.addNodeHighlight(this._id, true, "Overflow");
    pushTreeFrame(this._tree, highlight, nodeDataSnapshot);
    this._keys = prevKeys;
    this._children = prevChilds;
    this._keyCount--;
  }

  // split into two children and key
  var medianIndex = Math.floor(keys.length / 2);
  var medianKey = keys[medianIndex];
  var i;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let prevKeys = this._keys;
    this._keys = keys;
    this._keyCount++;
    let highlight = new HighlightData();
    highlight.addNodeHighlight(this._id, true, "Overflow");
    highlight.addNodeIndexHighlight(
      this._id,
      medianIndex,
      `Splitting at ${medianKey}`
    );
    pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
    this._keys = prevKeys;
    this._keyCount--;
  }

  //register the split
  this._tree._splitCounter++;

  // fix left child keys and children
  for (i = 0; i < keys.length; i++) {
    if (i < medianIndex) {
      left._children[i] = children[i];
      left._keys[i] = keys[i];
    } else if (i === medianIndex) {
      left._children[i] = children[i];
      left._keys[i] = null;
    } else {
      if (i != keys.length - 1) {
        left._children[i] = this._keys[i] = null;
      } else {
        left._children[i] = null;
      }
    }
  }
  left._keyCount = medianIndex;

  // fix right child keys and children
  for (i = medianIndex + 1; i < keys.length; i++) {
    right._keys[i - medianIndex - 1] = keys[i];
    right._children[i - medianIndex - 1] = children[i];
    right._keyCount += 1;
  }
  right._children[keys.length - medianIndex - 1] = children[keys.length];

  // FRAME SEGEMENT //
  // In this section the tree is temporarily modified in an illegal way, then a snapshot is made, and right after the tree is returned
  // to its original state.
  nodeDataSnapshot = this._tree.toNodeData(); //refresh the snapshot
  let tempID = this._tree._idCounter + 10;
  if (this._tree._sequenceMode) {
    let previousKeys = this._keys;
    let previousKeyCount = this._keyCount;
    let previousChilds = this._children;
    let previousID = this._id;
    let leftCopy = new BTreeNode(this._tree, this._maxKeys);
    leftCopy._keyCount = this._keyCount;
    leftCopy._keys = this._keys.slice();
    leftCopy._children = this._children;
    this._id = tempID;
    this._keyCount = 1;
    this._keys = this._keys.map((x) => null);
    this._keys[0] = medianKey;
    this._children = this._children.map((x) => null);
    this._children[0] = leftCopy;
    this._children[1] = right;
    nodeDataSnapshot = this._tree.toNodeData(); //refresh the snapshot after some temporary changes
    let highlight = new HighlightData();
    highlight.addNodeIndexHighlight(this._id, 0, "");
    highlight.addNodeHighlight(this._id, true, "");
    highlight.addNodeHighlight(this._children[0]._id, true, "");
    highlight.addNodeHighlight(this._children[1]._id, true, "");
    pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
    highlight = new HighlightData();
    highlight.addNodeHighlight(
      this._id,
      false,
      `${this._tree._root == this ? "new Root" : "insert into Parent"}`
    );
    this._tree._root != this
      ? highlight.addHighlightedSubtree(this._id, [0], nodeDataSnapshot)
      : highlight.addNodeIndexHighlight(this._id, 0, "");
    pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);

    if (parent) {
      let separatorIndex = parent._children.indexOf(this);
      highlight = new HighlightData();
      this._tree._root != this
        ? highlight.addHighlightedSubtree(this._id, [0], nodeDataSnapshot)
        : highlight.addNodeIndexHighlight(this._id, 0, "");
      highlight.addNodeHighlight(parent._id, true, "");
      highlight.addNodeSeparatorHighlight(parent._id, separatorIndex, "");
      highlight.addEdgeHighlightFromNodeId(parent._id, tempID, true);
      pushTreeFrameCustomData(this._tree, highlight, nodeDataSnapshot);
    }

    this._id = previousID;
    this._keyCount = previousKeyCount;
    this._keys = previousKeys;
    this._children = previousChilds;
  }

  return {
    left: left,
    key: medianKey,
    right: right,
    nodeDataSnapshot: nodeDataSnapshot,
    subTreeHighlightAt: this._tree._sequenceMode ? tempID : null,
  };
};

/**
 * This function finds the node containing the key, and performs either a leaf-node key remove or an internal node key remove.
 * For each child the parent node will also call a rebalance, rebalancing the tree in case the child underflowed.
 *
 * @param key - the Key that should be removed.
 *
 * @return { boolean } True if the key was removed, else false
 */
BTreeNode.prototype.remove = function (key) {
  if (this.isLeaf()) {
    // Leaf Node remove
    return this.removeKey(key);
  } else {
    var keyIndex = this._keys.indexOf(key);
    var child;

    if (keyIndex == -1) {
      // Children hold key
      if (this._tree._sequenceMode) {
        this._tree._sequenceMode = false;
        child = this.getChildContaining(key);
        this._tree._sequenceMode = true;
      } else {
        child = this.getChildContaining(key);
      }
      let childIndex = this._children.indexOf(child);

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        for (
          let i = this._keyCount * 2;
          i >= Math.max(childIndex * 2, 0);
          i--
        ) {
          if (!((this._keyCount * 2 - i) % 2 === 0)) {
            // highlight keyslot
            let highlight = new HighlightData();
            highlight.addNodeHighlight(this._id, false, `finding Key`);
            highlight.addNodeIndexHighlight(this._id, (i - 1) / 2, `${key} ?`);
            pushTreeFrame(this._tree, highlight);
          } else {
            // highlight separator
            let highlight = new HighlightData();
            highlight.addNodeHighlight(this._id, false, `finding Key`);
            highlight.addNodeSeparatorHighlight(
              this._id,
              i / 2,
              `${
                i != 0 * 2 ? String(this._keys[i / 2 - 1]) + " < " : ""
              }${key}${
                i != this._keyCount * 2 ? " < " + String(this._keys[i / 2]) : ""
              }${childIndex == i / 2 ? " ✓" : " ?"}  `
            );
            pushTreeFrame(this._tree, highlight);
          }
        }
        let highlight = new HighlightData();
        highlight.addEdgeHighlightFromNodeId(
          this._id,
          this._children[childIndex]._id,
          true
        );
        highlight.addNodeHighlight(this._children[childIndex]._id, true, "");
        pushTreeFrame(this._tree, highlight);
      }

      var result = child.remove(key);
      this.rebalance(childIndex);
      return result;
    } else {
      // Internal Node remove

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        for (
          let i = this._keyCount * 2;
          i >= Math.max(keyIndex * 2 + 1, 1);
          i--
        ) {
          if (!((this._keyCount * 2 - i) % 2 === 0)) {
            // highlight keyslot
            let highlight = new HighlightData();
            highlight.addNodeHighlight(this._id, false, `finding Key`);
            highlight.addNodeIndexHighlight(
              this._id,
              (i - 1) / 2,
              `${key}${keyIndex * 2 + 1 == i ? " ✓" : " ?"}`
            );
            pushTreeFrame(this._tree, highlight);
          } else {
            // highlight separator
            let highlight = new HighlightData();
            highlight.addNodeHighlight(this._id, false, `finding Key`);
            highlight.addNodeSeparatorHighlight(
              this._id,
              i / 2,
              `${
                i != 0 * 2 ? String(this._keys[i / 2 - 1]) + " < " : ""
              }${key}${
                i != this._keyCount * 2 ? " < " + String(this._keys[i / 2]) : ""
              } ?`
            );
            pushTreeFrame(this._tree, highlight);
          }
        }
        let highlight = new HighlightData();
        highlight.addNodeHighlight(this._id, false, "");
        highlight.addNodeIndexHighlight(
          this._id,
          keyIndex,
          `Replace Key with Predecessor`
        );
        pushTreeFrame(this._tree, highlight);

        highlight = new HighlightData();
        highlight.addNodeIndexHighlight(this._id, keyIndex, "");
        highlight.addEdgeHighlightFromNodeId(
          this._id,
          this._children[keyIndex]._id,
          true
        );
        highlight.addNodeHighlight(this._children[keyIndex]._id, true, "");
        pushTreeFrame(this._tree, highlight);

        highlight = new HighlightData();
        highlight.addNodeIndexHighlight(this._id, keyIndex, "");
        highlight.addNodeHighlight(
          this._children[keyIndex]._id,
          false,
          `Find Predecessor`
        );
        pushTreeFrame(this._tree, highlight);
      }

      let highlightSnapshot = new HighlightData();

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        highlightSnapshot.addNodeIndexHighlight(this._id, keyIndex, "");
      }

      // replace delete key with max key from left subtree
      child = this._children[keyIndex];
      let { maxKey, node } = child.extractMax(highlightSnapshot);

      // FRAME FRAGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new HighlightData();
        highlight.addNodeIndexHighlight(
          this._id,
          keyIndex,
          `Replace with ${maxKey}`
        );
        highlight.addNodeHighlight(this._id, true, "");
        highlight.addNodeIndexHighlight(
          node._id,
          node._keyCount - 1,
          `Remove ${maxKey}`
        );
        highlight.addNodeHighlight(node._id, true, "");
        pushTreeFrame(this._tree, highlight);
      }

      this._keys[keyIndex] = maxKey;
      child.removeMax();

      this.rebalance(keyIndex);

      return true;
    }
  }
};

/**
 * This function rebalances a child. If it is underflowed, resolve the underflow by first attempting to merge it with a sibling.
 * If that fails, do a rotation with a sibling
 *
 * @param childIndex - index of the child that needs to be rebalanced
 *
 */
BTreeNode.prototype.rebalance = function (childIndex) {
  let minKeys = Math.floor(this._maxKeys / 2);

  // if child did not underflow dont rebalance it
  var child = this._children[childIndex];
  if (child._keyCount >= minKeys) {
    return;
  }

  // child did UNDERFLOW

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeHighlight(child._id, true, "Underflow");
    pushTreeFrame(this._tree, highlight);
  }

  // TRY MERGING
  if (
    (childIndex > 0 && this._children[childIndex - 1]._keyCount == minKeys) ||
    (childIndex < this._keyCount &&
      this._children[childIndex + 1]._keyCount == minKeys)
  ) {
    if (childIndex > 0 && this._children[childIndex - 1]._keyCount == minKeys) {
      // left merge

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true, "Merge with left Sibling");
        highlight.addNodeHighlight(
          this._children[childIndex - 1]._id,
          true,
          ""
        );
        pushTreeFrame(this._tree, highlight);
      }

      childIndex -= 1;
    } else {
      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true, "Merge with right Sibling");
        highlight.addNodeHighlight(
          this._children[childIndex + 1]._id,
          true,
          ""
        );
        pushTreeFrame(this._tree, highlight);
      }
    }

    //performing the merge
    // childIndex will point to the *left* node of two merged nodes
    let leftKeyCount = this._children[childIndex]._keyCount;
    var merged = this.mergeChilds(childIndex);

    for (var i = childIndex; i < this._keyCount - 1; i += 1) {
      this._keys[i] = this._keys[i + 1];
    }
    for (var i = childIndex; i < this._keyCount; i += 1) {
      this._children[i] = this._children[i + 1];
    }
    this._keyCount--;
    this._children[childIndex] = merged;

    this._tree._mergeCounter++;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(
        this._children[childIndex]._id,
        true,
        "Merged node"
      );
      highlight.addNodeIndexHighlight(
        this._children[childIndex]._id,
        leftKeyCount,
        ""
      );
      pushTreeFrame(this._tree, highlight);
    }

    return;
  }

  // TRY ROTATION WITH LEFT CHILD
  if (childIndex > 0 && this._children[childIndex - 1]._keyCount > minKeys) {
    const leftChild = this._children[childIndex - 1];

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(
        child._id,
        true,
        `${leftChild.isLeaf() ? "Small" : "Big"} Rotation with left Sibling`
      );
      highlight.addNodeHighlight(leftChild._id, true, "");
      pushTreeFrame(this._tree, highlight);
      highlight = new HighlightData();
      highlight.addNodeHighlight(child._id, true, ``);
      highlight.addNodeHighlight(leftChild._id, true, "");
      highlight.addNodeIndexHighlight(this._id, childIndex - 1, "rotate right");
      highlight.addNodeIndexHighlight(
        leftChild._id,
        leftChild._keyCount - 1,
        "rotate right"
      );
      pushTreeFrame(this._tree, highlight);
    }

    // remember the last child on internal rebalances
    let lostChild = null;
    if (!leftChild.isLeaf()) {
      lostChild = leftChild._children[leftChild._keyCount];
    }

    for (var i = child._keyCount - 1; i >= 0; i--) {
      child._keys[i + 1] = child._keys[i];
    }
    child._keys[0] = this._keys[childIndex - 1];
    child._keyCount++;

    // fix parent
    this._keys[childIndex - 1] = leftChild._keys[leftChild._keyCount - 1];

    //re attach the lost child at the correct position
    if (lostChild) {
      this._tree._bigRotationCounter++;

      for (var i = child._keyCount; i >= 0; i--) {
        child._children[i + 1] = child._children[i];
      }

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        child._children[0] = new BTreeNode(this._tree, this._maxKeys);
        leftChild._keys[leftChild._keyCount - 1] = " ";

        let highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex - 1, "");
        highlight.addNodeIndexHighlight(child._id, 0, "");
        pushTreeFrame(this._tree, highlight);
        highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeHighlight(lostChild._id, false, "leftover Child");
        highlight.addNodeSeparatorHighlight(child._id, 0, "here");
        highlight.addHighlightedSubtree(
          leftChild._children[leftChild._keyCount]._id,
          Array.from(
            { length: leftChild._children[leftChild._keyCount]._keyCount },
            (_, index) => index
          ),
          this._tree.toNodeData()
        );
        pushTreeFrame(this._tree, highlight);
      }

      //reappend lost child
      child._children[0] = lostChild;
    } else {
      this._tree._smallRotationCounter++;
    }

    // fix left child
    leftChild._keys[leftChild._keyCount - 1] = null;
    leftChild._keyCount--;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      if (lostChild) {
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addHighlightedSubtree(
          child._children[0]._id,
          Array.from({ length: lostChild._keyCount }, (_, index) => index),
          this._tree.toNodeData()
        );
        pushTreeFrame(this._tree, highlight);
      } else {
        highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex - 1, "");
        highlight.addNodeIndexHighlight(child._id, 0, "");
        pushTreeFrame(this._tree, highlight);
      }
    }
    //rotation completed
    return;
  }

  // TRY ROTATION WITH RIGHT CHILD
  if (
    childIndex < this._keyCount &&
    this._children[childIndex + 1]._keyCount > minKeys
  ) {
    const rightChild = this._children[childIndex + 1];

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(
        child._id,
        true,
        `${rightChild.isLeaf() ? "Small" : "Big"} Rotation with left Sibling`
      );
      highlight.addNodeHighlight(rightChild._id, true, "");
      pushTreeFrame(this._tree, highlight);
      highlight = new HighlightData();
      highlight.addNodeHighlight(child._id, true, ``);
      highlight.addNodeHighlight(rightChild._id, true, "");
      highlight.addNodeIndexHighlight(this._id, childIndex, "rotate left");
      highlight.addNodeIndexHighlight(rightChild._id, 0, "rotate left");
      pushTreeFrame(this._tree, highlight);
    }

    // remember the first child for on internal rebalances
    let lostChild = null;
    if (!rightChild.isLeaf()) {
      lostChild = rightChild._children[0];
    }

    child._keys[minKeys - 1] = this._keys[childIndex];
    child._keyCount++;

    // fix parent
    this._keys[childIndex] = rightChild._keys[0];

    if (lostChild) {
      this._tree._bigRotationCounter++;
      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        child._children[child._keyCount] = new BTreeNode(
          this._tree,
          this._maxKeys
        );
        rightChild._keys[0] = " ";

        let highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex, "");
        highlight.addNodeIndexHighlight(child._id, child._keyCount - 1, "");
        pushTreeFrame(this._tree, highlight);
        highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeHighlight(lostChild._id, false, "leftover Child");
        highlight.addNodeSeparatorHighlight(child._id, child._keyCount, "here");
        highlight.addHighlightedSubtree(
          rightChild._children[0]._id,
          Array.from(
            { length: rightChild._children[0]._keyCount },
            (_, index) => index
          ),
          this._tree.toNodeData()
        );
        pushTreeFrame(this._tree, highlight);
      }
    } else {
      this._tree._smallRotationCounter++;
    }

    for (var i = 0; i < rightChild._keyCount - 1; i++) {
      rightChild._keys[i] = rightChild._keys[i + 1];
    }
    for (var i = 0; i < rightChild._keyCount; i++) {
      rightChild._children[i] = rightChild._children[i + 1];
    }

    //reappend lost child
    child._children[child._keyCount] = lostChild;

    //fix right child
    rightChild._keys[rightChild._keyCount] = null;
    rightChild._keyCount--;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      if (lostChild) {
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addHighlightedSubtree(
          child._children[child._keyCount]._id,
          Array.from({ length: lostChild._keyCount }, (_, index) => index),
          this._tree.toNodeData()
        );
        pushTreeFrame(this._tree, highlight);
      } else {
        highlight = new HighlightData();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex, "");
        highlight.addNodeIndexHighlight(child._id, child._keyCount, "");
        pushTreeFrame(this._tree, highlight);
      }
    }
    //rotation completed
    return;
  }
};

/**
 * This function is called b BTreeNode.prototype.rebalance. This node will take 1 key and 2 mergable siblings and merge them into a single child.
 *
 * @param leftIndex - index of the left sibling of the childs that are to be merged
 *
 * @return { BTreeNode } the merged node
 */
BTreeNode.prototype.mergeChilds = function (leftIndex) {
  var key = this._keys[leftIndex];

  var left = this._children[leftIndex];
  var right = this._children[leftIndex + 1];

  // FRAME SEGMENT //
  // Highlights the node in the tree.
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeIndexHighlight(this._id, leftIndex, "middle Key");
    highlight.addNodeHighlight(left._id, true, "");
    highlight.addNodeHighlight(right._id, true, "");
    pushTreeFrame(this._tree, highlight);
  }

  left._keys[left._keyCount] = key;
  left._keyCount++;

  // copy other keys and children into the left child
  for (var i = 0; i < right._keyCount; i++) {
    left._children[left._keyCount] = right._children[i];
    left._keys[left._keyCount] = right._keys[i];
    left._keyCount += 1;
  }
  left._children[left._keyCount] = right._children[right._keyCount];

  return left;
};

/**
 * The function extracts the max key aswell as the node holding it from this node and all of its descendants
 *
 * @param highlightSnapshot - FOR FRAME SEGMENT ONLY, a highlightsnapshot, so node where the reference is not available at this point are still highlighted
 *
 * @return { Object } containing the max key, and a reference to thenode itself
 */

BTreeNode.prototype.extractMax = function (highlightSnapshot) {
  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = _.cloneDeep(highlightSnapshot);

    // Highlights the node in the tree.
    if (this.isLeaf()) {
      highlight.addNodeIndexHighlight(
        this._id,
        this._keyCount - 1,
        "Predecessor"
      );
      pushTreeFrame(this._tree, highlight);
    } else {
      highlight.addNodeHighlight(this._children[this._keyCount]._id, true, "");
      highlight.addEdgeHighlightFromNodeId(
        this._id,
        this._children[this._keyCount]._id,
        true
      );
      pushTreeFrame(this._tree, highlight);

      highlight = _.cloneDeep(highlightSnapshot);
      highlight.addNodeHighlight(
        this._children[this._keyCount]._id,
        false,
        `Find Predecessor`
      );
      pushTreeFrame(this._tree, highlight);
    }
  }

  var ret;
  // Returns the maxKey value of the node.
  if (this.isLeaf()) {
    ret = { maxKey: this._keys[this._keyCount - 1], node: this };
  } else {
    var child = this._children[this._keyCount];
    ret = child.extractMax(highlightSnapshot);
  }
  return ret;
};

/**
 * removes the biggest key in the subtree that is this node and all of its predecessors.
 */
BTreeNode.prototype.removeMax = function () {
  if (this.isLeaf()) {
    this._keyCount--;

    // FRAME FRAGMENT //
    let highlight = new HighlightData();
    pushTreeFrame(this._tree, highlight);
  } else {
    // move down to the right-most child until leaf level
    var child = this._children[this._keyCount];
    child.removeMax();
    this.rebalance(this._keyCount);
  }
};

/**
 * Remove key from this node
 *
 * @param key - the key that this node should remove
 *
 * @return { boolean } True if the key was found and removed
 */
BTreeNode.prototype.removeKey = function (key) {
  var keyIndex = this._keys.indexOf(key);

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    for (let i = this._keyCount - 1; i >= 0 && i >= keyIndex; i--) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, false, `finding Key`);
      highlight.addNodeIndexHighlight(
        this._id,
        i,
        `${key} ${keyIndex == i ? "✓" : "?"}`
      );
      pushTreeFrame(this._tree, highlight);
    }
  }

  if (keyIndex == -1) {
    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._id, true, `Key ${key} not found`);
      pushTreeFrame(this._tree, highlight);
    }

    return false;
  }
  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeIndexHighlight(this._id, keyIndex, `removing ${key}`);
    pushTreeFrame(this._tree, highlight);
  }

  for (var i = keyIndex + 1; i < this._keyCount; i += 1) {
    this._keys[i - 1] = this._keys[i];
  }
  this._keyCount--;

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new HighlightData();
    pushTreeFrame(this._tree, highlight);
  }

  return true;
};

/**
 * Node created in the process of a split
 *
 * @param split split object you want to form a new node from
 * @param maxKeys max keys
 * @param tree tree reference
 *
 * @return { BTreeNode } the new Node
 */
BTreeNode.fromSplit = function (split, maxKeys, tree) {
  var node = new BTreeNode(tree, maxKeys);

  node._keyCount = 1;
  node._keys[0] = split.key;
  node._children[0] = split.left;
  node._children[1] = split.right;

  return node;
};

/**
 * @return { Number } The height of the node (how far away from leaf level)
 */
BTreeNode.prototype.getHeight = function () {
  if (this.isLeaf()) {
    return 0;
  } else {
    const childDepths = this._children
      .slice(0, this._keyCount)
      .map(function (child) {
        return child.getHeight();
      });
    return Math.max(...childDepths) + 1;
  } 
};

/**
 * Returns a string representation of the tree. The string representation is suitable for debugging and visual inspection.
 *
 * @param indentOpt - Optional string to use for indentation. Default is " ".
 *
 * @return String representation of the tree as a string with indentation
 */
BTreeNode.prototype.toString = function (indentOpt) {
  const INDENT_STRING = "  ";

  indentOpt = indentOpt || "";

  if (this.isLeaf()) {
    return (
      indentOpt + "[" + this._keys.slice(0, this._keyCount).join(", ") + "]"
    );
  }

  var str = "";

  var childIndent = indentOpt + INDENT_STRING;
  var childStrings = this._children
    .slice(0, this._keyCount + 1)
    .map(function (child) {
      return child.toString(childIndent);
    });

  str = indentOpt + "[\n" + childStrings[0] + "\n";
  for (var i = 1; i < childStrings.length; i += 1) {
    str +=
      childIndent +
      this._keys[i - 1].toString() +
      "\n" +
      childStrings[i] +
      "\n";
  }
  str += indentOpt + "]";

  return str;
};

/**
 * Turns this node and all of its decendants into an object representation suited for reconstructing in the future.
 *
 *
 * @return { Object } An object representation of the node and its decendants
 */
BTreeNode.prototype.toNodeData = function () {
  const ret_obj = {
    name: {
      id: this._id,
      keys: this._keys.slice(0, this._keyCount).map(function (val) {
        return String(val);
      }),
    },
  };
  if (!this.isLeaf()) {
    ret_obj["children"] = this._children
      .slice(0, this._keyCount + 1)
      .map(function (child) {
        return child.toNodeData();
      });
  }

  return ret_obj;
};

/**
 * @param nodeData reconstruct node from nodeData object
 * @param keyType keys will be parsed as strings from the object, pass a type that the keys should be converted too
 *
 * @return { BTreeNode } a sub Tree of nodes constructed from the nodeData
 */
BTreeNode.prototype.import = function (nodeData, keyType) {
  this._id = nodeData.name.id;
  this._keyCount = nodeData.name.keys.length;

  for (let i = 0; i < this._keyCount; i++) {
    this._keys[i] =
      keyType == "number"
        ? parseFloat(nodeData.name.keys[i])
        : String(nodeData.name.keys[i]);
  }

  //reconstruct children too
  if (nodeData.hasOwnProperty("children")) {
    for (let i = 0; i < nodeData.children.length; i++) {
      this._children[i] = new BTreeNode(this._tree, this._maxKeys);
      this._children[i] = this._children[i].import(
        nodeData.children[i],
        keyType
      );
    }
  }
  return this;
};

/**
 * Creates a BTree instance. it will manage the tree of BTreeNodes, and act as an external access point
 *
 * @param maxKeys - The maximum number of keys each node may store
 */
function BTree(maxKeys) {
  this._sequenceMode = false; //if true BTree will store frames in the _frameBufferRef during operations
  this._frameBufferRef = null; // reference to a frameBuffer of a frameSequencer object
  this._maxKeys = maxKeys; //max Keys every node can store
  this._idCounter = 0; //counter incrementing in order to assign unique node ids to nodes
  this._root = new BTreeNode(this, this._maxKeys);

  // counters for balancing operations
  this._splitCounter = 0;
  this._mergeCounter = 0;
  this._smallRotationCounter = 0;
  this._bigRotationCounter = 0;
}

/**
 * resets all counters
 */
BTree.prototype.resetCounters = function () {
  this._splitCounter = 0;
  this._mergeCounter = 0;
  this._smallRotationCounter = 0;
  this._bigRotationCounter = 0;
};

/**
 * @return { boolean } are there any keys stored in the tree?
 */
BTree.prototype.isEmpty = function () {
  return this._root._keyCount == 0;
};

/**
 * @return { Number } Maximum number of keys each node can store
 */
BTree.prototype.getMaxKeys = function () {
  return this._maxKeys;
};

/**
 * @param key - key you are searching for
 *
 * @return { boolean } True if the key exists somewhere in the tree
 */
BTree.prototype.contains = function (key) {
  return this._root.contains(key);
};

/**
 * @return { Array } an ordered list of all keys stored in the tree
 */
BTree.prototype.getKeys = function () {
  return this._root.getKeys();
};

/**
 * @return { Array } An array of all nodes contained in the tree
 */
BTree.prototype.getNodes = function () {
  return this._root._keyCount > 0 ? this._root.getNodes() : [];
};

/**
 * @return { number } height of the tree
 */
BTree.prototype.getHeight = function () {
  return this._root.getHeight();
};

/**
 * @param key - a key you want to add into the tree. Needs to match the type of the keys in the tree
 */
BTree.prototype.add = function (key) {
  // FRAME SEGEMENT //
  if (this._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeHighlight(this._root._id, false, `Inserting ${key}`);
    pushTreeFrame(this, highlight);
  }

  var curr = this._root;

  //if the root did a split assign the median key as a new root
  var split = curr.add(key, null);
  if (!split) {
    return;
  }
  this._root = BTreeNode.fromSplit(split, this._maxKeys, this);
};

/**
 * @param key - a key that should be removed from the tree
 *
 * @return { boolean } True if the key was removed
 */
BTree.prototype.remove = function (key) {
  // FRAME SEGEMENT //
  if (this._sequenceMode) {
    let highlight = new HighlightData();
    highlight.addNodeHighlight(this._root._id, false, `Removing ${key}`);
    pushTreeFrame(this, highlight);
  }

  var removed = this._root.remove(key);

  // merge took last child from root, child will become new root
  if (this._root._keyCount == 0 && this._root._children[0]) {
    this._root = this._root._children[0];
    if (this._sequenceMode) {
      let highlight = new HighlightData();
      highlight.addNodeHighlight(this._root._id, true, `new root`);
      pushTreeFrame(this, highlight);
    }
  }

  return removed;
};

/**
 * @return { String } A string representation of the whole tree
 */
BTree.prototype.toString = function () {
  return this._root.toString();
};

/**
 * @return { Object } the nodeData of the tree as an hierachical object (included is what is relevant for rendering)
 */
BTree.prototype.toNodeData = function () {
  return this._root.toNodeData();
};

/**
 * @param treeData - A treeData object or string, containing all infos required for reconstruction(maxKeys, keyType, treeData)
 *
 * @return { BTree } new BTree reconstructed from treeData object
 */
BTree.prototype.import = function (treeData) {
  treeData = JSON.parse(treeData);
  const btree = new BTree(treeData.maxKeys);
  btree._root = btree._root.import(treeData.nodeData, treeData.keyType);
  return btree;
};

/**
 * @return { string } A TreeData object representing the tree as a string. suited for later reconstruction via BTree.protoype.import
 */
BTree.prototype.export = function () {
  // TREEDATA OBJECT
  return JSON.stringify({
    maxKeys: this._maxKeys,
    keyType: this._root.isEmpty ? "number" : typeof this._root._keys[0],
    nodeData: this.toNodeData(),
  });
};

export default BTree;
