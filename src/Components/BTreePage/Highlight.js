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

    addNodeIndexHighlight(nodeId, indexHighlight, indexMessage) {
      if (!this.nodes[nodeId]) {
        this.nodes[nodeId] = {
          fullHighlight: false,
          nodeMessage: "",
          indexHighlights: [indexHighlight],
          indexMessages: [""],
        };
      }
    
      if (!this.nodes[nodeId].indexHighlights) {
        this.nodes[nodeId].indexHighlights = [];
      }
      if (!this.nodes[nodeId].indexMessages) {
        this.nodes[nodeId].indexMessages = [];
      }
    
      this.nodes[nodeId].indexHighlights.push(indexHighlight);
      this.nodes[nodeId].indexMessages.push(indexMessage);
    }
    
  
    addEdgeHighlight(edgeId, fullHighlight, message) {
      this.edges[edgeId] = {
        fullHighlight,
        message,
      };
    }
  }
  
  export default Highlight