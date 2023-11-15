
/**
 * Class that may be filled with entries as to what parts of the B-Tree Visualization should be highlightend and how.
 * Ever treeFrame should include such an object, BTreePlot.jsx unpacks it, to render the Tree
 */

class HighlightData {
  /**
  * initiates an empty object, with the necessary fields
  */
  constructor() {
    this.nodes = {};
    this.edges = {};
  }

  /**
   *Initiates a full node Entry for highlighting. the fields must be modified first to see changes though
   *BTreePlot.jsx expects all fields to be initialized at least, if an entry exists.
   *This function called internally, where needed, no need to call it from outside. 
  * @param nodeId - node that should be highlighted
  */
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

  /** 
  * @param nodeId 
  * @param fullHighlight - adds a orange square around the whole node if true
  * @param nodeMessage - if not empty, adds a message above the node 
  */
  addNodeHighlight(nodeId, fullHighlight, nodeMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId] = {
      ...this.nodes[nodeId],
      fullHighlight,
      nodeMessage,
    };
  }

  /**
  * @param nodeId
  * @param indexHighlightAt - highlights the key with this index within the specified node blue, adds a blue square around it too. 
  * @param indexMessage - if not empty, adds a message below the key at the specified index
  */
  addNodeIndexHighlight(nodeId, indexHighlightAt, indexMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId].indexHighlights.push(indexHighlightAt);
    this.nodes[nodeId].indexMessages[indexHighlightAt] = indexMessage;
  }

  /**
  * @param nodeId
  * @param separatorHighlightAt - makes the separator between keys with this index blue
  * @param separatorMessage - if not empty, adds a message below the separator at the specified index
  */
  addNodeSeparatorHighlight(nodeId, separatorHighlightAt, separatorMessage) {
    this.initiateNodeEntry(nodeId);

    this.nodes[nodeId].separatorHighlights.push(separatorHighlightAt);
    this.nodes[nodeId].separatorMessages[separatorHighlightAt] =
      separatorMessage;
  }

  /**
  * @param edgeId - edgeId is a combined string of "[SourceNodeId][TargetNodeId]"
  * @param fullHighlight - if true, the highlight is thick and orange, if false its blue 
  */
  addEdgeHighlightFromEdgeId(edgeId, fullHighlight) {
    this.edges[edgeId] = {
      fullHighlight,
    };
  }

  /**
  * @param sourceNodeId - id of the source node
  * @param targetNodeId - id of the target node
  * @param fullHighlight - if true, the highlight is thick and orange, if false its blue  
  */
  addEdgeHighlightFromNodeId(sourceNodeId, targetNodeId, fullHighlight) {
    this.edges[String(sourceNodeId) + String(targetNodeId)] = {
      fullHighlight,
    };
  }

  /**
  * highlights an index of a node, and mark everything that is decendant from that index blue. 
  * 
  * @param nodeId - The id of the "sub-tree parent" node for highlighting
  * @param fromIndicesList - List of all indeces for keys in the sub-tree parent node that should have highlighted subtrees. 
  * @param nodeData - a nodeData Object, where hierachichical info on the node can be obtained
  * @param inSubtree - if true, subt-tree highlight every index of this node, usually should not be set to true when called from the outside
  */
  addHighlightedSubtree(nodeId, fromIndicesList, nodeData, inSubtree = false) {
    let reachedSubtree = inSubtree;
    if (reachedSubtree) {
      //already within the desires subtree -> make all indeces and child edges blue
      for (let i = 0; i < nodeData.name.keys.length; i++) {
        this.addNodeIndexHighlight(nodeData.name.id, i, "");
        if (nodeData.hasOwnProperty("children")){
          this.addEdgeHighlightFromNodeId(parseFloat(nodeData.name.id), parseFloat(nodeData.children[i].name.id), false)
        }
      }
      if (nodeData.hasOwnProperty("children")){
        this.addEdgeHighlightFromNodeId(parseFloat(nodeData.name.id), parseFloat(nodeData.children[nodeData.name.keys.length].name.id), false)
      }

    } else {
      reachedSubtree = nodeData.name.id == nodeId;
      if (reachedSubtree) {
        //just reached the parent of the subtree

        for (let i = 0; i < fromIndicesList.length; i++) {
          let index = fromIndicesList[i];
          this.addNodeIndexHighlight(nodeId, index, "");
          if (nodeData.hasOwnProperty("children")) {
            //add highlight to left subtree
            this.addEdgeHighlightFromNodeId(nodeId, parseFloat(nodeData.children[index].name.id), false)
            this.addHighlightedSubtree(
              nodeId,
              fromIndicesList,
              nodeData.children[index],
              reachedSubtree
            );
            //add highlight to right subtree
            this.addEdgeHighlightFromNodeId(nodeId, parseFloat(nodeData.children[index +1].name.id), false)
            this.addHighlightedSubtree(
              nodeId,
              fromIndicesList,
              nodeData.children[index + 1],
              reachedSubtree
            )
          }
        }
        return;
      }
    }
    //pass this function along to all children 
    if (nodeData.hasOwnProperty("children")) {
      for (let i = 0; i < nodeData.children.length; i++) {
        this.addHighlightedSubtree(
          nodeId,
          fromIndicesList,
          nodeData.children[i],
          reachedSubtree
        );
      }
    }
  }


}

export default HighlightData;
