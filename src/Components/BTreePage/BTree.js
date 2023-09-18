#!/usr/bin/env node
import Highlight from "./Highlight";
import _ from "lodash";

function arrayOfSize(size) {
  var a = Array(size);

  for (var i = 0; i < size; i += 1) a[i] = null;

  return a;
}

function pushTreeFrame(tree, highlight) {
  if (tree._sequenceMode) {
    tree._frameBufferRef.push({
      treeData: tree.toTreeData(),
      highlights: highlight,

      splits: tree._splitCounter,
      merges: tree._mergeCounter,
      smallRotations: tree._smallRotationCounter,
      bigRotations: tree._bigRotationCounter,
    });
  }
}

function pushTreeFrameCustomData(tree, highlight, treeData) {
  if (tree._sequenceMode) {
    tree._frameBufferRef.push({
      treeData: treeData,
      highlights: highlight,

      splits: tree._splitCounter,
      merges: tree._mergeCounter,
      smallRotations: tree._smallRotationCounter,
      bigRotations: tree._bigRotationCounter,
    });
  }
}

function BTreeNode(tree, maxKeys) {
  this._tree = tree;
  this._tree._idCounter++;
  this._id = this._tree._idCounter;
  this._maxKeys = maxKeys;
  this._keyCount = 0;
  this._keys = arrayOfSize(this._maxKeys);
  this._childs = arrayOfSize(this._maxKeys + 1);
}

BTreeNode.prototype.isLeaf = function () {
  return this._childs[0] === null;
};

BTreeNode.prototype.isFull = function () {
  return this._keyCount == this._maxKeys;
};

BTreeNode.prototype.contains = function (key) {
  if (this.isLeaf()) {
    return this._keys.indexOf(key) != -1;
  } else {
    for (let i = 0; i < this._keyCount; i++) {
      if (key == this._keys[i]) {
        return true;
      }
      if (key < this._keys[i]) {
        return this._childs[i].contains(key);
      }
      if (i == this._keyCount - 1) {
        return this._childs[i + 1].contains(key);
      }
    }
    return false;
  }
};

BTreeNode.prototype.getKeys = function () {
  if (this.isLeaf()) {
    return this._keys.slice(0, this._keyCount);
  } else {
    let keys = this._childs[0].getKeys();
    for (let i = 0; i < this._keyCount; i++) {
      keys.push(this._keys[i]);
      keys = keys.concat(this._childs[i + 1].getKeys());
    }
    return keys;
  }
};

BTreeNode.prototype.getNodes = function () {
  if (this.isLeaf()) {
    return [this];
  }
  return [this].concat(
    ...this._childs
      .filter((node) => node !== null)
      .map((node) => node.getNodes())
  );
};

BTreeNode.prototype.add = function (key, parent) {
  if (this.isLeaf()) {
    if (this.isFull()) {
      return this.split(key, null, null, parent);
    } else {
      this.insertKey(key);
      return null;
    }
  } else {
    var child = this.getChildContaining(key);

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(child._id, true, "");
      highlight.addEdgeHighlightFromNodeId(this._id, child._id, true);
      pushTreeFrame(this._tree, highlight);
    }

    var split = child.add(key, this);
    if (!split) {
      return null;
    }

    if (this.isFull()) {
      // split this node
      return this.split(
        split.key,
        split.right,
        split.treeDataSnapshot,
        parent,
        split.subTreeHighlightAt
      );
    } else {
      this.insertSplit(split);
      return null;
    }
  }
};

BTreeNode.prototype.insertKey = function (key) {
  // perform insertion sort on keys

  var pos = this._keyCount;
  var keys = this._keys;

  let treeDataSnapshot = this._tree.toTreeData();
  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    if (!this._tree.isEmpty()) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, false, "Finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    }
  }

  while (pos > 0 && keys[pos - 1] > key) {
    keys[pos] = keys[pos - 1];
    pos--;

    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, false, "Finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    }
  }

  keys[pos] = key;
  this._keyCount += 1;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeIndexHighlight(this._id, pos, "");
    pushTreeFrame(this._tree, highlight);
  }
};

BTreeNode.prototype.insertSplit = function (split) {
  // splited child
  var child = split.left;

  var pos = this._keyCount;
  while (pos > 0 && this._childs[pos] !== child) {
    this._keys[pos] = this._keys[pos - 1];
    this._childs[pos + 1] = this._childs[pos];
    pos--;
  }

  this._keys[pos] = split.key;
  this._childs[pos + 1] = split.right;
  this._keyCount += 1;

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    let treeDataSnapshot = this._tree.toTreeData();
    highlight.addHighlightedSubtree(this._id, [pos], treeDataSnapshot);
    pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
  }
};

BTreeNode.prototype.getChildContaining = function (key) {
  for (var i = this._keyCount; i >= 1; i--) {
    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, false, "Finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        i,
        `${key} ${this._keys[i - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrame(this._tree, highlight);
    }

    if (key > this._keys[i - 1]) {
      return this._childs[i];
    }
  }
  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeHighlight(this._id, false, "Finding position");
    highlight.addNodeSeparatorHighlight(this._id, 0, `${key} ✓`);
    pushTreeFrame(this._tree, highlight);
  }

  return this._childs[0];
};

BTreeNode.prototype.split = function (
  key,
  keyRightChild,
  treeDataSnapshot,
  parent,
  subTreeHighlightAt = null
) {
  var left = this;
  var right = new BTreeNode(this._tree, this._maxKeys);

  // temp storage for keys and childs
  var keys = this._keys.slice();
  keys.push(null);

  var childs = this._childs.slice();
  childs.push(null);
  // find new key position
  var pos = keys.length - 1;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    if(!subTreeHighlightAt){
    let highlight = new Highlight();
    highlight.addNodeHighlight(this._id, false, "Finding position");
    highlight.addNodeSeparatorHighlight(
      this._id,
      pos,
      `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
    );
    
    pushTreeFrameCustomData(
      this._tree,
      highlight,
      treeDataSnapshot ? treeDataSnapshot : this._tree.toTreeData()
    );
  }
}

  while (pos > 0 && keys[pos - 1] > key) {
    keys[pos] = keys[pos - 1];
    childs[pos + 1] = childs[pos];
    pos--;

    // FRAME SEGEMENT //
    if (this._tree._sequenceMode) {
      if(!subTreeHighlightAt){
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, false, "Finding position");
      highlight.addNodeSeparatorHighlight(
        this._id,
        pos,
        `${key} ${keys[pos - 1] > key ? " ?" : " ✓"}`
      );
      pushTreeFrameCustomData(
        this._tree,
        highlight,
        treeDataSnapshot ? treeDataSnapshot : this._tree.toTreeData()
      );
    }
  }
  }

  keys[pos] = key;
  childs[pos + 1] = keyRightChild;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let prevKeys = this._keys;
    let prevChilds = this._childs;
    this._keys = keys;
    this._childs = childs;
    this._keyCount++;
    let highlight = new Highlight();
    treeDataSnapshot = this._tree.toTreeData();
    highlight.addNodeIndexHighlight(this._id, pos, "");
    if (subTreeHighlightAt) {
      highlight.addHighlightedSubtree(this._id, [pos], treeDataSnapshot);
    }
    pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);

    highlight = new Highlight();
    highlight.addNodeHighlight(this._id, true, "Overflow");
    pushTreeFrame(this._tree, highlight, treeDataSnapshot);
    this._keys = prevKeys;
    this._childs = prevChilds;
    this._keyCount--;
  }

  // split into two childs and key
  var medianIndex = Math.floor(keys.length / 2);
  var medianKey = keys[medianIndex];
  var i;

  // FRAME SEGEMENT //
  if (this._tree._sequenceMode) {
    let prevKeys = this._keys;
    this._keys = keys;
    this._keyCount++;
    let highlight = new Highlight();
    highlight.addNodeHighlight(this._id, true, "Overflow");
    highlight.addNodeIndexHighlight(
      this._id,
      medianIndex,
      `Splitting at ${medianKey}`
    );
    pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    this._keys = prevKeys;
    this._keyCount--;
  }

  this._tree._splitCounter++;

  // fix left child keys and childs
  for (i = 0; i < keys.length; i++) {
    if (i < medianIndex) {
      left._childs[i] = childs[i];
      left._keys[i] = keys[i];
    } else if (i === medianIndex) {
      left._childs[i] = childs[i];
      left._keys[i] = null;
    } else {
      if (i != keys.length - 1) {
        left._childs[i] = this._keys[i] = null;
      } else {
        left._childs[i] = null;
      }
    }
  }
  left._keyCount = medianIndex;

  // fix right child keys and childs
  for (i = medianIndex + 1; i < keys.length; i++) {
    right._keys[i - medianIndex - 1] = keys[i];
    right._childs[i - medianIndex - 1] = childs[i];
    right._keyCount += 1;
  }
  right._childs[keys.length - medianIndex - 1] = childs[keys.length];

  // FRAME SEGEMENT //
  treeDataSnapshot = this._tree.toTreeData();
  let tempID = this._tree._idCounter + 10;
  if (this._tree._sequenceMode) {
    let previousKeys = this._keys;
    let previousKeyCount = this._keyCount;
    let previousChilds = this._childs;
    let previousID = this._id;
    let leftCopy = new BTreeNode(this._tree, this._maxKeys);
    leftCopy._keyCount = this._keyCount;
    leftCopy._keys = this._keys.slice();
    leftCopy._childs = this._childs;
    this._id = tempID;
    this._keyCount = 1;
    this._keys = this._keys.map((x) => null);
    this._keys[0] = medianKey;
    this._childs = this._childs.map((x) => null);
    this._childs[0] = leftCopy;
    this._childs[1] = right;
    treeDataSnapshot = this._tree.toTreeData();
    let highlight = new Highlight();
    highlight.addNodeIndexHighlight(this._id, 0, "");
    highlight.addNodeHighlight(this._id, true, "");
    highlight.addNodeHighlight(this._childs[0]._id, true, "");
    highlight.addNodeHighlight(this._childs[1]._id, true, "");
    pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    highlight = new Highlight();
    highlight.addNodeHighlight(
      this._id,
      false,
      `${this._tree._root == this ? "New Root" : "Insert into Parent"}`
    );
    this._tree._root != this
      ? highlight.addHighlightedSubtree(this._id, [0], treeDataSnapshot)
      : highlight.addNodeIndexHighlight(this._id, 0, "");
    pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    if (parent) {
      let separatorIndex = parent._childs.indexOf(this);
      highlight = new Highlight();
      this._tree._root != this
        ? highlight.addHighlightedSubtree(this._id, [0], treeDataSnapshot)
        : highlight.addNodeIndexHighlight(this._id, 0, "");
      highlight.addNodeHighlight(parent._id, true, "");
      highlight.addNodeSeparatorHighlight(parent._id, separatorIndex, "");
      highlight.addEdgeHighlightFromNodeId(parent._id, tempID, true);
      pushTreeFrameCustomData(this._tree, highlight, treeDataSnapshot);
    }

    this._id = previousID;
    this._keyCount = previousKeyCount;
    this._keys = previousKeys;
    this._childs = previousChilds;
  }

  return {
    left: left,
    key: medianKey,
    right: right,
    treeDataSnapshot: treeDataSnapshot,
    subTreeHighlightAt: this._tree._sequenceMode ? tempID : null,
  };
};

BTreeNode.prototype.remove = function (key) {
  if (this.isLeaf()) {
    // Leaf Node remove
    return this.removeKey(key);
  } else {
    var keyIndex = this._keys.indexOf(key);
    var child;

    if (keyIndex === -1) {
      // Children hold key
      if (this._tree._sequenceMode) {
        this._tree._sequenceMode = false;
        child = this.getChildContaining(key);
        this._tree._sequenceMode = true;
      } else {
        child = this.getChildContaining(key);
      }
      let childIndex = this._childs.indexOf(child);

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        for (
          let i = this._keyCount * 2;
          i >= Math.max(childIndex * 2, 0);
          i--
        ) {
          if (!((this._keyCount * 2 - i) % 2 === 0)) {
            // highlight keyslot
            let highlight = new Highlight();
            highlight.addNodeHighlight(this._id, false, `Finding Key`);
            highlight.addNodeIndexHighlight(this._id, (i - 1) / 2, `${key} ?`);
            pushTreeFrame(this._tree, highlight);
          } else {
            // highlight separator
            let highlight = new Highlight();
            highlight.addNodeHighlight(this._id, false, `Finding Key`);
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
        let highlight = new Highlight();
        highlight.addEdgeHighlightFromNodeId(
          this._id,
          this._childs[childIndex]._id,
          true
        );
        highlight.addNodeHighlight(this._childs[childIndex]._id, true, "");
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
            let highlight = new Highlight();
            highlight.addNodeHighlight(this._id, false, `Finding Key`);
            highlight.addNodeIndexHighlight(
              this._id,
              (i - 1) / 2,
              `${key}${keyIndex * 2 + 1 == i ? " ✓" : " ?"}`
            );
            pushTreeFrame(this._tree, highlight);
          } else {
            // highlight separator
            let highlight = new Highlight();
            highlight.addNodeHighlight(this._id, false, `Finding Key`);
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
        let highlight = new Highlight();
        highlight.addNodeHighlight(this._id, false, "");
        highlight.addNodeIndexHighlight(
          this._id,
          keyIndex,
          `Replace Key with Predecessor`
        );
        pushTreeFrame(this._tree, highlight);

        highlight = new Highlight();
        highlight.addNodeIndexHighlight(this._id, keyIndex, "");
        highlight.addEdgeHighlightFromNodeId(
          this._id,
          this._childs[keyIndex]._id,
          true
        );
        highlight.addNodeHighlight(this._childs[keyIndex]._id, true, "");
        pushTreeFrame(this._tree, highlight);

        highlight = new Highlight();
        highlight.addNodeIndexHighlight(this._id, keyIndex, "");
        highlight.addNodeHighlight(
          this._childs[keyIndex]._id,
          false,
          `Find Predecessor`
        );
        pushTreeFrame(this._tree, highlight);
      }

      let highlightSnapshot = new Highlight();

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        highlightSnapshot.addNodeIndexHighlight(this._id, keyIndex, "");
      }

      // replace key with max key from left child
      child = this._childs[keyIndex];
      let { maxKey, node } = child.extractMax(highlightSnapshot);

      // FRAME FRAGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new Highlight();
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

BTreeNode.prototype.rebalance = function (childIndex) {
  let minKeys = Math.floor(this._maxKeys / 2);

  // if child did not underflow dont rebalance it
  var child = this._childs[childIndex];
  if (child._keyCount >= minKeys) {
    return;
  }

  //UNDERFLOW

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeHighlight(child._id, true, "Underflow");
    pushTreeFrame(this._tree, highlight);
  }

  // TRY MERGING

  if (
    (childIndex > 0 && this._childs[childIndex - 1]._keyCount == minKeys) ||
    (childIndex < this._keyCount &&
      this._childs[childIndex + 1]._keyCount == minKeys)
  ) {
    if (childIndex > 0 && this._childs[childIndex - 1]._keyCount == minKeys) {
      // left merge

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true, "Merge with left Sibling");
        highlight.addNodeHighlight(this._childs[childIndex - 1]._id, true, "");
        pushTreeFrame(this._tree, highlight);
      }

      childIndex -= 1;
    } else {
      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        let highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true, "Merge with right Sibling");
        highlight.addNodeHighlight(this._childs[childIndex + 1]._id, true, "");
        pushTreeFrame(this._tree, highlight);
      }
    }

    //performing the merge
    // childIndex will point to the *left* node of two merged nodes
    let leftKeyCount = this._childs[childIndex]._keyCount;
    var merged = this.mergeChilds(childIndex);

    for (var i = childIndex; i < this._keyCount - 1; i += 1) {
      this._keys[i] = this._keys[i + 1];
    }
    for (var i = childIndex; i < this._keyCount; i += 1) {
      this._childs[i] = this._childs[i + 1];
    }
    this._keyCount--;
    this._childs[childIndex] = merged;

    this._tree._mergeCounter++;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(
        this._childs[childIndex]._id,
        true,
        "Merged node"
      );
      highlight.addNodeIndexHighlight(
        this._childs[childIndex]._id,
        leftKeyCount,
        ""
      );
      pushTreeFrame(this._tree, highlight);
    }

    return;
  }

  // TRY ROTATION WITH LEFT CHILD
  if (childIndex > 0 && this._childs[childIndex - 1]._keyCount > minKeys) {
    const leftChild = this._childs[childIndex - 1];

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(
        child._id,
        true,
        `${leftChild.isLeaf() ? "Small" : "Big"} Rotation with left Sibling`
      );
      highlight.addNodeHighlight(leftChild._id, true, "");
      pushTreeFrame(this._tree, highlight);
      highlight = new Highlight();
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
      lostChild = leftChild._childs[leftChild._keyCount];
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
        child._childs[i + 1] = child._childs[i];
      }

      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        child._childs[0] = new BTreeNode(this._tree, this._maxKeys);
        leftChild._keys[leftChild._keyCount - 1] = " ";

        let highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex - 1, "");
        highlight.addNodeIndexHighlight(child._id, 0, "");
        pushTreeFrame(this._tree, highlight);
        highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeHighlight(lostChild._id, false, "leftover child");
        highlight.addNodeSeparatorHighlight(child._id, 0, "here");
        highlight.addHighlightedSubtree(
          leftChild._childs[leftChild._keyCount]._id,
          Array.from(
            { length: leftChild._childs[leftChild._keyCount]._keyCount },
            (_, index) => index
          ),
          this._tree.toTreeData()
        );
        pushTreeFrame(this._tree, highlight);
      }

      //reappend lost child
      child._childs[0] = lostChild;
    } else {
      this._tree._smallRotationCounter++;
    }

    // fix left child
    leftChild._keys[leftChild._keyCount - 1] = null;
    leftChild._keyCount--;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      if (lostChild) {
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addHighlightedSubtree(
          child._childs[0]._id,
          Array.from({ length: lostChild._keyCount }, (_, index) => index),
          this._tree.toTreeData()
        );
        pushTreeFrame(this._tree, highlight);
      } else {
        highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(leftChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex - 1, "");
        highlight.addNodeIndexHighlight(child._id, 0, "");
        pushTreeFrame(this._tree, highlight);
      }
    }
    return;
  }

  // TRY ROTATION WITH RIGHT CHILD
  if (
    childIndex < this._keyCount &&
    this._childs[childIndex + 1]._keyCount > minKeys
  ) {
    const rightChild = this._childs[childIndex + 1];

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(
        child._id,
        true,
        `${rightChild.isLeaf() ? "Small" : "Big"} Rotation with left Sibling`
      );
      highlight.addNodeHighlight(rightChild._id, true, "");
      pushTreeFrame(this._tree, highlight);
      highlight = new Highlight();
      highlight.addNodeHighlight(child._id, true, ``);
      highlight.addNodeHighlight(rightChild._id, true, "");
      highlight.addNodeIndexHighlight(this._id, childIndex, "rotate left");
      highlight.addNodeIndexHighlight(rightChild._id, 0, "rotate left");
      pushTreeFrame(this._tree, highlight);
    }

    // remember the first child for on internal rebalances
    let lostChild = null;
    if (!rightChild.isLeaf()) {
      lostChild = rightChild._childs[0];
    }

    child._keys[minKeys - 1] = this._keys[childIndex];
    child._keyCount++;

    // fix parent
    this._keys[childIndex] = rightChild._keys[0];

    if (lostChild) {
      this._tree._bigRotationCounter++;
      // FRAME SEGMENT //
      if (this._tree._sequenceMode) {
        child._childs[child._keyCount] = new BTreeNode(
          this._tree,
          this._maxKeys
        );
        rightChild._keys[0] = " ";

        let highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex, "");
        highlight.addNodeIndexHighlight(child._id, child._keyCount - 1, "");
        pushTreeFrame(this._tree, highlight);
        highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeHighlight(lostChild._id, false, "leftover child");
        highlight.addNodeSeparatorHighlight(child._id, child._keyCount, "here");
        highlight.addHighlightedSubtree(
          rightChild._childs[0]._id,
          Array.from(
            { length: rightChild._childs[0]._keyCount },
            (_, index) => index
          ),
          this._tree.toTreeData()
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
      rightChild._childs[i] = rightChild._childs[i + 1];
    }

    //reappend lost child
    child._childs[child._keyCount] = lostChild;

    //fix right child
    rightChild._keys[rightChild._keyCount] = null;
    rightChild._keyCount--;

    // FRAME SEGMENT //
    if (this._tree._sequenceMode) {
      let highlight = new Highlight();
      if (lostChild) {
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addHighlightedSubtree(
          child._childs[child._keyCount]._id,
          Array.from({ length: lostChild._keyCount }, (_, index) => index),
          this._tree.toTreeData()
        );
        pushTreeFrame(this._tree, highlight);
      } else {
        highlight = new Highlight();
        highlight.addNodeHighlight(child._id, true);
        highlight.addNodeHighlight(rightChild._id, true, "");
        highlight.addNodeIndexHighlight(this._id, childIndex, "");
        highlight.addNodeIndexHighlight(child._id, child._keyCount, "");
        pushTreeFrame(this._tree, highlight);
      }
    }
    return;
  }
};

BTreeNode.prototype.mergeChilds = function (leftIndex) {
  var key = this._keys[leftIndex];

  var left = this._childs[leftIndex];
  var right = this._childs[leftIndex + 1];

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeIndexHighlight(this._id, leftIndex, "Middle Key");
    highlight.addNodeHighlight(left._id, true, "");
    highlight.addNodeHighlight(right._id, true, "");
    pushTreeFrame(this._tree, highlight);
  }

  left._keys[left._keyCount] = key;
  left._keyCount++;

  // copy right keys and childs into left
  for (var i = 0; i < right._keyCount; i++) {
    left._childs[left._keyCount] = right._childs[i];
    left._keys[left._keyCount] = right._keys[i];
    left._keyCount += 1;
  }
  left._childs[left._keyCount] = right._childs[right._keyCount];

  return left;
};

BTreeNode.prototype.extractMax = function (highlightSnapshot) {
  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = _.cloneDeep(highlightSnapshot);

    if (this.isLeaf()) {
      highlight.addNodeIndexHighlight(
        this._id,
        this._keyCount - 1,
        "Predecessor"
      );
      pushTreeFrame(this._tree, highlight);
    } else {
      highlight.addNodeHighlight(this._childs[this._keyCount]._id, true, "");
      highlight.addEdgeHighlightFromNodeId(
        this._id,
        this._childs[this._keyCount]._id,
        true
      );
      pushTreeFrame(this._tree, highlight);

      highlight = _.cloneDeep(highlightSnapshot);
      highlight.addNodeHighlight(
        this._childs[this._keyCount]._id,
        false,
        `Find Predecessor`
      );
      pushTreeFrame(this._tree, highlight);
    }
  }

  var ret;
  if (this.isLeaf()) {
    ret = { maxKey: this._keys[this._keyCount - 1], node: this };
  } else {
    var child = this._childs[this._keyCount];
    ret = child.extractMax(highlightSnapshot);
  }
  return ret;
};

BTreeNode.prototype.removeMax = function () {
  if (this.isLeaf()) {
    this._keyCount--;

    // FRAME FRAGMENT //
    let highlight = new Highlight();
    pushTreeFrame(this._tree, highlight);
  } else {
    var child = this._childs[this._keyCount];
    child.removeMax();
    this.rebalance(this._keyCount);
  }
};

BTreeNode.prototype.removeKey = function (key) {
  var keyIndex = this._keys.indexOf(key);

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    for (let i = this._keyCount - 1; i >= 0 && i >= keyIndex; i--) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, false, `Finding Key`);
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
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._id, true, `Key ${key} not found`);
      pushTreeFrame(this._tree, highlight);
    }

    return false;
  }
  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeIndexHighlight(this._id, keyIndex, `Removing ${key}`);
    pushTreeFrame(this._tree, highlight);
  }

  for (var i = keyIndex + 1; i < this._keyCount; i += 1) {
    this._keys[i - 1] = this._keys[i];
  }
  this._keyCount--;

  // FRAME SEGMENT //
  if (this._tree._sequenceMode) {
    let highlight = new Highlight();
    pushTreeFrame(this._tree, highlight);
  }

  return true;
};

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
  var childStrings = this._childs
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

BTreeNode.prototype.toTreeData = function () {
  const ret_obj = {
    name: {
      id: this._id,
      keys: this._keys.slice(0, this._keyCount).map(function (val) {
        return String(val);
      }),
    },
  };
  if (!this.isLeaf()) {
    ret_obj["children"] = this._childs
      .slice(0, this._keyCount + 1)
      .map(function (child) {
        return child.toTreeData();
      });
  }

  return ret_obj;
};

BTreeNode.fromSplit = function (split, maxKeys, tree) {
  var node = new BTreeNode(tree, maxKeys);

  node._keyCount = 1;
  node._keys[0] = split.key;
  node._childs[0] = split.left;
  node._childs[1] = split.right;

  return node;
};

BTreeNode.prototype.getHeight = function () {
  if (this.isLeaf()) {
    return 0;
  } else {
    const childDepths = this._childs
      .slice(0, this._keyCount)
      .map(function (child) {
        return child.getHeight();
      });
    return Math.max(...childDepths) + 1;
  }
};

BTreeNode.prototype.import = function (treeData, keyType) {
  this._id = treeData.name.id;
  this._keyCount = treeData.name.keys.length;

  console.log("supposed type " + keyType);
  console.log(keyType == "number");

  for (let i = 0; i < this._keyCount; i++) {
    this._keys[i] =
      keyType == "number"
        ? parseFloat(treeData.name.keys[i])
        : String(treeData.name.keys[i]);
  }

  if (treeData.hasOwnProperty("children")) {
    for (let i = 0; i < treeData.children.length; i++) {
      this._childs[i] = new BTreeNode(this._tree, this._maxKeys);
      this._childs[i] = this._childs[i].import(treeData.children[i], keyType);
    }
  }
  return this;
};

function BTree(maxKeys, setTreeProps) {
  this._setTreeProps = setTreeProps;
  this._sequenceMode = false;
  this._frameBufferRef = null;
  this._maxKeys = maxKeys;
  this._idCounter = 0;
  this._root = new BTreeNode(this, this._maxKeys);

  this._splitCounter = 0;
  this._mergeCounter = 0;
  this._smallRotationCounter = 0;
  this._bigRotationCounter = 0;
}

BTree.prototype.resetCounters = function () {
  this._splitCounter = 0;
  this._mergeCounter = 0;
  this._smallRotationCounter = 0;
  this._bigRotationCounter = 0;
};

BTree.prototype.isEmpty = function () {
  return this._root._keyCount == 0;
};

BTree.prototype.getMaxKeys = function () {
  return this._maxKeys;
};

BTree.prototype.contains = function (key) {
  return this._root.contains(key);
};

BTree.prototype.getKeys = function () {
  return this._root.getKeys();
};

BTree.prototype.getNodes = function () {
  return this._root._keyCount > 0 ? this._root.getNodes() : [];
};

BTree.prototype.getHeight = function () {
  return this._root.getHeight();
};

BTree.prototype.add = function (key) {
  // FRAME SEGEMENT //
  if (this._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeHighlight(this._root._id, false, `Inserting ${key}`);
    pushTreeFrame(this, highlight);
  }

  var curr = this._root;

  var split = curr.add(key, null);
  if (!split) {
    return;
  }

  this._root = BTreeNode.fromSplit(split, this._maxKeys, this);
};

BTree.prototype.remove = function (key) {
  // FRAME SEGEMENT //
  if (this._sequenceMode) {
    let highlight = new Highlight();
    highlight.addNodeHighlight(this._root._id, false, `Removing ${key}`);
    pushTreeFrame(this, highlight);
  }

  var removed = this._root.remove(key);

  // merge took last child from root, child will become new root
  if (this._root._keyCount == 0 && this._root._childs[0]) {
    this._root = this._root._childs[0];
    if (this._sequenceMode) {
      let highlight = new Highlight();
      highlight.addNodeHighlight(this._root._id, true, `new root`);
      pushTreeFrame(this, highlight);
    }
  }

  return removed;
};

BTree.prototype.toString = function () {
  return this._root.toString();
};

BTree.prototype.toTreeData = function () {
  return this._root.toTreeData();
};

BTree.prototype.import = function (treeImport) {
  treeImport = JSON.parse(treeImport);
  const btree = new BTree(treeImport.maxKeys, this._setTreeProps);
  btree._root = btree._root.import(treeImport.treeData, treeImport.keyType);
  console.log("Type " + typeof btree._root._keys[0]);
  return btree;
};

BTree.prototype.export = function () {
  return JSON.stringify({
    maxKeys: this._maxKeys,
    keyType: this._root.isEmpty ? "number" : typeof this._root._keys[0],
    treeData: this.toTreeData(),
  });
};

export default BTree;
