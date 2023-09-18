import React from "react";
import "./BTreeInfo.css"; // Make sure to create the corresponding CSS file
import Button from "@mui/material/Button";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

const BTreeInfo = ({ loadTreePreset }) => {
  return (
    <div className="info-container">
      <h1>The B-Tree</h1>
      <div className="info-section">
        <h2>Overview</h2>
        <div className="info-section-segment-bottom-border">
          <div className="info-section-segment-title">
            <p>Inventors:</p>
          </div>

          <p>Conceived by Rudolf Bayer and Edward McCreight in 1970.</p>
        </div>
        <div className="info-section-segment-text">
          <p>
            The B-Tree<span className="greyed-out-text">[1]</span> is a
            self-balancing hierarchical data structure designed for efficient
            indexing and retrieval of data. The nodes within the tree store keys
            and corresponding data pointers, referencing the associated data.
            Nodes may also have tree pointers, linking to other nodes (child
            nodes), forming a multi-level structure.
          </p>
        </div>

        <div className="info-section-segment-top-border">
          <div className="info-section-segment-title">
            <p>Properties:</p>
          </div>
          <div>
            <p>
              According to Elmasri and Navathe, a{" "}
              <span className="highlighted-text">
                B-Tree of order <i>p</i>
              </span>{" "}
              satisfies the following properties{" "}
              <span className="greyed-out-text">[2][simplified]</span>:
            </p>

            <ol className="b-tree-property-list">
              <li>
                Nodes store keys as separators between sub-trees (children).
              </li>
              <li>Nodes store keys in order.</li>
              <li>
                The sub-tree "left" to a key only contains smaller keys, and the
                "right" sub-tree contains bigger ones.
              </li>
              <li>
                Each node has at most <i>p</i> children.
              </li>
              <li>
                Every internal node has at least ⌈<i>p</i>/2⌉ children. The root
                node has at least 2 children unless it is the only node in the
                tree.
              </li>
              <li>
                A node with <i>q</i> children contains <i>q</i> - 1 keys.
              </li>
              <li>
                All leaves appear on the same level.{" "}
                <span className="greyed-out-text">
                  They have the same structure as internal nodes, but their tree
                  pointers are NULL (NULL-pointers are not depicted in the
                  visualization above).
                </span>
              </li>
            </ol>

            <p>
              Note that the terminology used for B-Trees often varies. In the
              original paper<span className="greyed-out-text">[1]</span>, Bayer
              and McCreight define a B-Tree as part of <b>Class</b> <i>τ</i>(
              <i>k</i>, <i>h</i>), where <i>h</i> refers to the height of the
              tree, and <i>k</i> refers to the minimum number of keys in each
              non-root node. Since then, less ambiguous definitions like the one
              above have been used more frequently, where B-Tree <b>Order</b> is
              defined as the maximum number of children per node. Even still,
              terminology differs. Just to name a few examples from important
              educational literature: Knuth uses <i>m</i> for order
              <span className="greyed-out-text">[3]</span>, Cormen calls it{" "}
              <i>t</i>
              <span className="greyed-out-text"> [4]</span>, Kemper uses{" "}
              <i>k</i>
              <span className="greyed-out-text"> [5]</span>, Elmasri and
              Navathe, as well as this website, use <i>p</i>
              <span className="greyed-out-text"> [2]</span>.
            </p>
          </div>
        </div>

        <div className="info-section-segment-double-border">
          <div className="info-section-segment-title">
            <p>Purpose:</p>
          </div>
          <p>
            The B-Tree was invented for the efficient organization and
            management of large datasets, especially on disk-based storage.
            <ul>
              <li>
                The balanced structure allows for consistent runtime and
                logarithmic complexity across operations.
              </li>
              <li>
                Properly sizing nodes to disk page dimensions reduces
                time-intensive disk I/O operations.
              </li>
              <li>Keys being stored in order helps with range queries.</li>
              <li>
                Well-suited for indexing/managing large datasets.
                <ul>
                  <li>
                    The B-Tree is optimized for running on disk; neither the
                    B-Tree nor the data needs to be held in memory.
                  </li>
                  <li>
                    The broad but shallow nature of the B-Tree keeps runtimes
                    low on operations.
                  </li>
                  <li>
                    Minimum fill rate of nodes ensures efficient storage usage.
                  </li>
                </ul>
              </li>
            </ul>
          </p>
        </div>

        <div className="info-section-segment-text">
          <p>
            The B-Tree is/was widely used in real-world applications, especially
            in file and database systems. Even more common are variations of the
            B-Tree, improving the original concept in different ways.
          </p>
        </div>
        <div className="info-section-segment-top-border">
          <div className="info-section-segment-title">
            <p>Variations:</p>
          </div>
          <div>
            <p>
              The most prevalent variation is the <b>B+-Tree</b>{" "}
              <span className="greyed-out-text"> [6]</span>. It differentiates
              itself by having only the leaf nodes store data pointers, while
              the upper levels are used for indexing only. In addition, leaf
              nodes are typically organized into an ordered doubly linked list,
              making sequential accesses and range queries more efficient. Other
              advantages include better Disk I/O efficiency and better
              utilization of storage.
            </p>
            <p>
              The <b>B*-Tree</b> is a variation where nodes are filled at least
              2/3 <span className="greyed-out-text"> [3]</span>. To achieve
              this, it introduces the mechanism of delayed and combined node
              splits/merges. This enhances performance on insertions and
              deletions, as well as reducing tree height and having fuller
              nodes.
            </p>
            <p>
              The <b>UB-Tree</b> is a less frequently used specialization of the
              B+-Tree <span className="greyed-out-text"> [7]</span>. It is a
              multidimensional indexing structure, providing efficiency across
              all operations but especially on multidimensional range queries.
            </p>
            <p>
              Before deciding on using any of these variations, the specific use
              case needs to be considered. How advantageous they are, if at all,
              will largely depend on the access patterns.
            </p>
          </div>
        </div>

        <div className="info-section-segment-top-border">
          <div className="info-section-segment-title">
            <p>References:</p>
          </div>
          <div>
            <p>
              <ol className="bracketed-list">
                <li>
                  <div>
                    R. Bayer and E. McCreight, ‘Organization and Maintenance of
                    Large Ordered Indices’, in
                    <i>
                      &nbsp;Proceedings of the 1970 ACM SIGFIDET (Now SIGMOD)
                      Workshop on Data Description, Access, and Control
                    </i>
                    , Houston, Texas, 1970, pp. 107–141.
                  </div>
                </li>
                <li>
                  <div>
                    R. Elmasri and S. Navathe,
                    <i>&nbsp;Fundamentals of Database Systems</i>, 7th ed. USA:
                    Addison-Wesley Publishing Company, 2010. pp. 619-622.
                  </div>
                </li>
                <li>
                  <div>
                    D. E. Knuth,
                    <i>
                      &nbsp;The Art of Computer Programming: Sorting and
                      Searching
                    </i>
                    , 2nd ed., vol. 3. USA: Addison Wesley Longman Publishing
                    Co., Inc., 1998. pp. 482-489.
                  </div>
                </li>
                <li>
                  <div>
                    T. H. Cormen, C. Stein, R. L. Rivest, and C. E. Leiserson,
                    <i>&nbsp;Introduction to Algorithms</i>, 2nd ed. McGraw-Hill
                    Higher Education, 2001. pp. 374-377.
                  </div>
                </li>
                <li>
                  <div>
                    A. Kemper and A. Eickler,
                    <i>&nbsp;Datenbanksysteme - Eine Einführung</i>, 6th ed.
                    Oldenbourg, 2006. pp. 211-215.
                  </div>
                </li>
                <li>
                  <div>
                    D. Comer, ‘Ubiquitous B-Tree’,
                    <i>&nbsp;ACM Comput. Surv.</i>, vol. 11, no. 2, pp. 121–137,
                    Jun. 1979.
                  </div>
                </li>
                <li>
                  <div>
                    R. Bayer, ‘The Universal B-Tree for Multidimensional
                    Indexing: General Concepts’, in
                    <i>
                      &nbsp;Proceedings of the International Conference on
                      Worldwide Computing and Its Applications{" "}
                    </i>
                    , 1997, pp. 198–209.
                  </div>
                </li>
              </ol>
            </p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>Algorithms</h2>
        <p>
          Across operations, the above-mentioned B-Tree properties need to be
          preserved.
        </p>

        <div className="info-section-segment-top-border">
          <div className="info-section-segment-title">
            <p>Seek:</p>
          </div>
          <div>
            <p>
              Seek works just like in a Binary Search Tree, only that the nodes
              hold more keys. Consider each node as containing keys, but
              indirectly also key ranges, i.e., smaller than the smallest key,
              bigger than the biggest key, one between each adjacent key pair.{" "}
              <br></br>Start traversing the root node, both keys and ranges.
              Either the key is held by the node directly, or it falls within
              one of the key ranges. In the second case, if it is a leaf node,
              the tree does not contain the sought key. If it is a non-leaf
              node, repeat the process in the child containing keys within that
              range.
            </p>
          </div>
        </div>

        <div className="info-section-segment-top-border">
          <div className="info-section-segment-title">
            <p>Insert:</p>
          </div>
          <div>
            <p>
              First, find the leaf node where the key needs to be inserted, in a
              similar way to the Seek operation described above. Then, insert
              the key at the correct position within that node. If the node now
              contains <i>p</i> keys, an <b>Overflow</b> has occurred. It is
              handled in the following way:
            </p>
            <ol>
              <li>
                Identify the median key at index ⌊<i>p</i>/2⌋ and place it
                within a new node.
              </li>
              <li>
                Keys smaller than the median become the left child of the
                median's node, and bigger keys become the right child (keep
                their preexisting children).
              </li>
              <li>
                Insert the node holding the median key into the parent of the
                node that originally overflowed. This may cause the parent node
                to overflow as well. In that case, repeat steps 1-3 in the
                parent node.
              </li>
            </ol>
            <p>
              Should the root overflow, then the node holding the median key
              becomes the new root, increasing the tree's height by one.
            </p>

            {/* INSERT EXAMPLE BUTTON*/}
            <div className="btree-show-example-button-container-margin">
              <Button
                className="btree-info-button"
                variant="text"
                size="small"
                color="orange"
                startIcon={<KeyboardDoubleArrowUpIcon />}
                endIcon={<KeyboardDoubleArrowUpIcon />}
                onClick={() => loadTreePreset("insertExample")}
              >
                see insert example
              </Button>
            </div>
          </div>
        </div>

        <div className="info-section-segment-double-border">
          <div className="info-section-segment-title">
            <p>Delete:</p>
          </div>
          <div>
            <p>
              <b>Deletion</b>
            </p>
            <p>
              Use the Seek Operation to find the Key that ought to be deleted.
              If the key is found, consider 2 cases:
            </p>

            <ul>
              <li>The node containing the key is a leaf-node.</li>
              <ol>
                <li>Delete the key from the node.</li>
                <li>
                  If the node now has fewer than ⌈<i>p</i>/2⌉ - 1 keys, an{" "}
                  <b>Underflow</b> has occurred. In that case, perform a{" "}
                  <b>Rebalance</b> on the node (explained in the section below).
                </li>
              </ol>

              <li>
                The node containing the key is not a leaf-node<br></br>
                &nbsp;&nbsp;&nbsp;
                <i>
                  In an internal node, keys act as separators between sub-trees,
                  therefore they cannot simply be deleted.
                </i>
              </li>
              <ol>
                <li>
                  Locate the predecessor, i.e. the biggest key of the left
                  sub-tree, by moving down to the leaf level always through the
                  rightmost child. The last key of that node is what you are
                  looking for.
                </li>
                <li>
                  Remove the predecessor from its node and use it as a
                  replacement for the to-be-deleted key.
                </li>
                <li>
                  If step 2 triggers an <b>Underflow</b> at the leaf level,
                  resolve it with a <b>Rebalance</b> (explained in the section
                  below).
                </li>
              </ol>
            </ul>

            {/* DELETE EXAMPLE BUTTON */}
            <div className="btree-show-example-button-container">
              <Button
                className="btree-info-button"
                variant="text"
                size="small"
                color="orange"
                startIcon={<KeyboardDoubleArrowUpIcon />}
                endIcon={<KeyboardDoubleArrowUpIcon />}
                onClick={() => loadTreePreset("deleteExample")}
              >
                see delete examples
              </Button>
            </div>

            <p className="small-top-margin">
              <b>Rebalance</b>
            </p>
            <p>
              Rebalancing always starts off at the leaf-level but may propagate
              up to the root. The following section explains the steps of
              rebalancing a node with an <b>Underflow</b>:
            </p>
            <ul>
              <li>
                First, check if a sibling (adjacent node with the same immediate
                parent) exists that has exactly ⌈<i>p</i>/2⌉ - 1 keys. If so,
                perform a <b>Merge</b> with that sibling:
                <ol>
                  <li>
                    Combine the siblings into a single node, furthermore insert
                    the separator key from the parent between them. Keep the
                    children of the siblings.
                  </li>
                  <li>
                    Remove the separator key from the parent, at the index where
                    it was removed, append the new merged node as a child.
                  </li>
                  <li>
                    If this caused an <b>Underflow</b> in the parent node,
                    continue the <b>Rebalance</b> in the parent node. Note that
                    the root does not underflow (Check B-Tree Properties).
                    Instead, when its last key is taken by the merged node
                    below, the root disappears and the merged node becomes the
                    new root, reducing the tree's height by 1.
                  </li>
                </ol>
              </li>

              </ul>
              {/* MERGE EXAMPLE BUTTON */}
              <div className="btree-show-example-button-container">
                <Button
                  className="btree-info-button"
                  variant="text"
                  size="small"
                  color="orange"
                  startIcon={<KeyboardDoubleArrowUpIcon />}
                  endIcon={<KeyboardDoubleArrowUpIcon />}
                  onClick={() => loadTreePreset("mergeExample")}
                >
                  see merge example
                </Button>
              </div>
              <ul>

              <li>
                If no mergable sibling exists, choose a sibling that contains at
                least ⌈<i>p</i>/2⌉ keys and perform a <b>Rotation</b> with it.
                If the siblings are leaves, we may call it a{" "}
                <b>small Rotation</b>, and a <b>big Rotation</b> otherwise.
                <ol>
                  <li>
                    If the rotation-sibling is a left-sibling, take its biggest
                    key; otherwise, take its smallest, remove it, and move it up
                    to the parent-node, where it replaces the separator key
                    between the siblings.
                  </li>
                  <li>
                    Insert the separator key in the underflow-node, on the side
                    facing the rotation-sibling.
                  </li>
                  <li>
                    If the siblings were not leaves, the rotation sibling will
                    leave a parentless sub-tree, at the position where its key
                    was removed. That sub-tree needs to be appended to the
                    underflow node, at the position where it gained its new key,
                    as the outermost child.
                  </li>
                </ol>
              </li>
            </ul>
            {/* ROTATION EXAMPLE BUTTON */}
            <div className="btree-show-example-button-container-margin">
              <Button
                className="btree-info-button"
                variant="text"
                size="small"
                color="orange"
                startIcon={<KeyboardDoubleArrowUpIcon />}
                endIcon={<KeyboardDoubleArrowUpIcon />}
                onClick={() => loadTreePreset("rotationExample")}
              >
                see rotation examples
              </Button>
            </div>
          </div>
        </div>
        <div className="info-section-segment-text">
          <p>
            Note that the algorithms above are described as they are implemented
            in the visualization. While the general concepts are always the
            same, details may differ across implementations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BTreeInfo;
