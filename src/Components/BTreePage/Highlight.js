import { tree } from "d3";

class Highlight {
  constructor() {
    this.nodes = {};
    this.edges = {};
  }

  initiateNodeEntry(nodeId) {
    if (!this.nodes[nodeId]) {
      this.nodes[nodeId] = {
        fullHighlight: false,
        nodeMessage: "",
        indexHighlights: [],
        indexMessages: {},
        separatorHighlights: [],
        separatorMessages: {},
      };
    }
  }

  addNodeHighlight(nodeId, fullHighlight, nodeMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId] = {
      ...this.nodes[nodeId], // Keep previous properties
      fullHighlight,
      nodeMessage,
    };
  }

  addNodeIndexHighlight(nodeId, indexHighlightAt, indexMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId].indexHighlights.push(indexHighlightAt);
    this.nodes[nodeId].indexMessages[indexHighlightAt] = indexMessage;
  }

  addNodeSeparatorHighlight(nodeId, separatorHighlightAt, separatorMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId].separatorHighlights.push(separatorHighlightAt);
    this.nodes[nodeId].separatorMessages[separatorHighlightAt] =
      separatorMessage;
  }

  addEdgeHighlightFromEdgeId(edgeId, fullHighlight) {
    this.edges[edgeId] = {
      fullHighlight,
    };
  }

  addEdgeHighlightFromNodeId(sourceNodeId, targetNodeId, fullHighlight) {
    this.edges[String(sourceNodeId) + String(targetNodeId)] = {
      fullHighlight,
    };
  }

  addHighlightedSubtree(nodeId, fromIndicesList, treeData, inSubtree = false) {
    let reachedSubtree = inSubtree;
    if (reachedSubtree) {
      for (let i = 0; i < treeData.name.keys.length; i++) {
        this.addNodeIndexHighlight(treeData.name.id, i, "");
      }
    } else {
      reachedSubtree = treeData.name.id == nodeId;
      if (reachedSubtree) {
        for (let i = 0; i < fromIndicesList.length; i++) {
          let index = fromIndicesList[i];
          this.addNodeIndexHighlight(nodeId, index, "");

          if (treeData.hasOwnProperty("children")) {
            this.addHighlightedSubtree(
              nodeId,
              fromIndicesList,
              treeData.children[index],
              reachedSubtree
            );
            this.addHighlightedSubtree(
              nodeId,
              fromIndicesList,
              treeData.children[index + 1],
              reachedSubtree
            );
          }
        }
        return;
      }
    }
    if (treeData.hasOwnProperty("children")) {
      for (let i = 0; i < treeData.children.length; i++) {
        this.addHighlightedSubtree(
          nodeId,
          fromIndicesList,
          treeData.children[i],
          reachedSubtree
        );
      }
    }
  }


}

export default Highlight;
