#!/usr/bin/env node

function arrayOfSize(size) {
    var a = Array(size);

    for (var i = 0; i < size; i += 1)
        a[i] = null;

    return a;
}

function BTreeNode(nKeys) {
    this.NKEYS = nKeys
    this._keyCount = 0;
    this._keys = arrayOfSize(this.NKEYS);
    this._childs = arrayOfSize(this.NKEYS+1);
}

BTreeNode.prototype.isLeaf = function() {
    return (this._childs[0] === null);
};

BTreeNode.prototype.isFull = function() {
    return (this._keyCount === this.NKEYS);
};

BTreeNode.prototype.keyCount = function() {
    return this._keyCount;
};

BTreeNode.prototype.add = function(key) {
    if (this.isLeaf()) {
        if (this.isFull()) {
            return this.split(key, null);
        }
        else {
            this.insertKey(key);
            return null;
        }
    }
    else {
        var child = this.getChildContaining(key);
        
        var split = child.add(key);
        if (!split) return null;

        if (this.isFull()) {
            // split this node
            return this.split(split.key, split.right);
        }
        else {
            this.insertSplit(split);
            return null;
        }
    }
};

BTreeNode.prototype.insertKey = function(key) {
    console.assert( this.isLeaf() );

    // perform insertion sort on keys
    
    var pos = this.keyCount();
    var keys = this._keys;

    while (pos > 0 && keys[pos-1] > key) {
        keys[pos] = keys[pos-1];
        pos--;
    }

    keys[pos] = key;
    this._keyCount += 1;
};

BTreeNode.prototype.insertSplit = function(split) {
    // splited child
    var child = split.left;

    // insert key with right child poped up from
    // child node
    
    // case A: first child was split
    if (child === this._childs[0]) {
        for (var i = this._keyCount; i > 0; i--)
            this._keys[i] = this._keys[i-1];
        this._keys[0] = split.key;

        for (var i = this._keyCount+1; i > 1; i--)
            this._childs[i] = this._childs[i-1];
        this._childs[0] = child;
        this._childs[1] = split.right;
    }
    
    // case B: [key][split-child] (split child is on the right)
    else {
        var pos = this._keyCount;
        while (pos > 0 && this._childs[pos] !== child) {
            this._keys[pos] = this._keys[pos-1];
            this._childs[pos+1] = this._childs[pos];
            pos--;
        }

        this._keys[pos] = split.key;
        this._childs[pos+1] = split.right;
    }

    // rest
    this._keyCount += 1;
};

BTreeNode.prototype.getChildContaining = function(key) {
    for (var i = 0; i < this.keyCount(); i += 1) {
        if (key <= this._keys[i]) {
            return this._childs[i];
        }
    }

    return this._childs[this.keyCount()];
};

BTreeNode.prototype.split = function(key, keyRightChild) {
    var left = this;
    var right = new BTreeNode(this.NKEYS);

    // temp storage for keys and childs
    var keys = this._keys.slice();
    keys.push(null);

    var childs = this._childs.slice();
    childs.push(null);

    // find new key position
    var pos = keys.length-1;
    while (pos > 0 && keys[pos-1] > key) {
        keys[pos] = keys[pos-1];
        childs[pos+1] = childs[pos];
        pos--;
    }

    keys[pos] = key;
    childs[pos+1] = keyRightChild;

    // split into two childs and key
    var medianIndex = Math.floor(keys.length / 2);
    var medianKey = this._keys[medianIndex];
    var i;

    // fix left child keys and childs
    for (i = 0; i < keys.length; i++) {
        if (i < medianIndex) {
            left._childs[i] = childs[i];
            left._keys[i] = keys[i];
        }
        else if (i === medianIndex) {
            left._childs[i] = childs[i];
            left._keys[i] = null;
        }
        else {
            left._childs[i] = this._keys[i] = null;
        }
    }
    left._keyCount = medianIndex;

    // fix right child keys and childs
    for (i = 0; i < keys.length; i++) {
        if (i > medianIndex) {
            right._keys[i-medianIndex-1] = keys[i];
            right._childs[i-medianIndex-1] = childs[i];
            right._keyCount += 1;
        }
    }
    right._childs[keys.length-medianIndex-1] = childs[keys.length];

    return ({ left:left, key:medianKey, right:right });
};

BTreeNode.prototype.remove = function(key) {
    if (this.isLeaf()) {
        return this.removeKey(key);
    }
    else {
        var keyIndex = this.indexOfKey(key);
        var child;

        if (keyIndex === (-1)) {
            child = this.getChildContaining(key);
            var result = child.remove(key);

            this.rebalance(this._childs.indexOf(child));
            return result;
        }
        else {
            // replace key with max key from left child
            child = this._childs[keyIndex];
            this._keys[keyIndex] = child.extractMax();

            this.rebalance(keyIndex);
            return true;
        }
    }
};

BTreeNode.prototype.rebalance = function(childIndex) {
    this.MIN_NKEYS = (this.NKEYS/2);

    var child = this._childs[childIndex];
    if (child.keyCount() >= this.MIN_NKEYS) {
        return;
    }

    // borrow from left child
    if (childIndex) {
        var leftChild = this._childs[childIndex-1];
        if (leftChild.keyCount() > this.MIN_NKEYS) {
            var lastKey = leftChild._keys[leftChild.keyCount()-1];
            var lastChild = leftChild._child[leftChild.keyCount()];
            leftChild._keyCount--;

            var key = this._keys[childIndex-1];
            this._keys[childIndex-1] = lastKey;

            for (var i = child._keyCount-1; i >= 0; i--) {
                child._keys[i+1] = child._keys[i];
            }
            child._keys[0] = key;

            for (var i = child._keyCount; i >= 0; i--) {
                child._childs[i+1] = child._childs[i];
            }
            child._childs[0] = lastChild;
            child._keyCount++;

            return;
        }
    }
    
    // borrow from right child
    if (childIndex < this.keyCount()) {
        var rightChild = this._childs[childIndex+1];
        if (rightChild.keyCount() > this.MIN_NKEYS) {
            var firstKey = rightChild._keys[0];
            var firstChild = rightChild._childs[0];

            for (var i = 0; i < rightChild.keyCount()-1; i++) {
                rightChild._keys[i] = rightChild._keys[i+1];
            }

            for (var i = 0; i < rightChild.keyCount(); i++) {
                rightChild._childs[i] = rightChild._childs[i+1];
            }

            rightChild._keyCount--;

            child._keys[child.keyCount()] = this._keys[childIndex];
            this._keys[childIndex] = firstKey;
            child._childs[child.keyCount()+1] = firstChild;
            child._keyCount++;

            return;
        }
    }
   
    // merge
    if (childIndex) {
        // merge left and current
        childIndex -= 1;
    }

    // childIndex will point to the *left* node of two merged nodes
    
    var merged = this.mergeChilds(childIndex);
    
    for (var i = childIndex; i < this._keyCount-1; i += 1) {
        this._keys[i] = this._keys[i+1];
    }
    for (var i = childIndex; i < this._keyCount; i += 1) {
        this._childs[i] = this._childs[i+1];
    }
    this._keyCount--;
    this._childs[childIndex] = merged;
};

BTreeNode.prototype.mergeChilds = function(leftIndex) {
    var key = this._keys[leftIndex];

    var left = this._childs[leftIndex];
    var right = this._childs[leftIndex+1];

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

BTreeNode.prototype.extractMax = function() {
    var key;

    if (this.isLeaf()) {
        key = this._keys[this._keyCount-1];
        this._keyCount--;
    }
    else {
        var child = this._childs[this._keyCount];
        key = child.extractMax();

        this.rebalance(this._keyCount);
    }

    return key;
};

BTreeNode.prototype.indexOfKey = function(key) {
    for (var i = 0; i < this._keyCount; i += 1) {
        if (this._keys[i] === key) {
            return i;
        }
    }

    return (-1);
};

BTreeNode.prototype.removeKey = function(key) {
    console.assert( this.isLeaf() );
 
    var keyIndex = this.indexOfKey(key);
    if (keyIndex === (-1))
        return false;

    // delete key
    for (var i = keyIndex+1; i < this._keyCount; i += 1) {
        this._keys[i-1] = this._keys[i];
    }

    this._keyCount--;
    return true;
};

BTreeNode.prototype.toString = function(indentOpt) {
    const INDENT_STRING = '  ';

    indentOpt = indentOpt || '';

    if (this.isLeaf()) {
        return indentOpt + '[' + 
            this._keys.slice(0, this.keyCount()).join(', ') + 
            ']';
    }

    var str = '';

    var childIndent = indentOpt + INDENT_STRING;
    var childStrings = this._childs.
        slice(0, this.keyCount()+1).
        map(function(child) {
            return child.toString(childIndent);
        });

    str = indentOpt + '[\n' + childStrings[0] + '\n';
    for (var i = 1; i < childStrings.length; i += 1) {
        str += childIndent + this._keys[i-1].toString() + '\n' + 
            childStrings[i] + '\n';
    }
    str += indentOpt + ']';

    return str;
};


BTreeNode.prototype.toTreeData = function() {
    const ret_obj = {
        name : this._keys.slice(0, this.keyCount())
    }
    if (!this.isLeaf()) {
        const copyChilds = this._childs; // Create a shallow copy of the array
        const cleanCopyChilds = copyChilds.filter(function(value) {
            return value !== null;
          });
        ret_obj['children'] = cleanCopyChilds.map(function(child) {
            return child.toTreeData();
        })

    }
    
    return ret_obj;
};

BTreeNode.fromSplit = function(split, nKeys) {
    var node = new BTreeNode(nKeys);

    node._keyCount = 1;
    node._keys[0] = split.key;
    node._childs[0] = split.left;
    node._childs[1] = split.right;

    return node;
};

function BTree(nKeys) {
    this.NKEYS = nKeys;
    this._root = new BTreeNode(this.NKEYS);
}

BTree.prototype.isEmpty = function(){
    return this._root._keyCount == 0
}


BTree.prototype.add = function(key) {
    var curr = this._root;

    var split = curr.add(key);
    if (!split) return;

    this._root = BTreeNode.fromSplit(split, this.NKEYS);
};

BTree.prototype.remove = function(key) {
    var removed = this._root.remove(key);

    if (this._root.keyCount() === 0 && this._root._childs[0]) {
        this._root = this._root._childs[0];
    }

    return removed;
};

BTree.prototype.toString = function() {
    return this._root.toString();
};

BTree.prototype.toTreeData = function() {
    return this._root.toTreeData();
};

export default BTree;