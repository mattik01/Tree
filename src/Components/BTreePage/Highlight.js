class Highlight {
    constructor() {
      this.nodes = {};
      this.edges = {};
    }
  
    addNodeHighlight(nodeId, fullHighlight, nodeMessage, indexHighlights, indexMessages) {
      this.nodes[nodeId] = {
        fullHighlight,
        nodeMessage,
        indexHighlights,
        indexMessages,
      };
    }
  
    addEdgeHighlight(edgeId, fullHighlight, message) {
      this.edges[edgeId] = {
        fullHighlight,
        message,
      };
    }
  }
  
  export default Highlight