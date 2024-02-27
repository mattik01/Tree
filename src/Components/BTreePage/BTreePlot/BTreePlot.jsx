import "./BTreePlot.css";

// libraries
import React, { useState, useEffect } from "react";
import { Tree } from "react-d3-tree";

// ---------- GLOBAL VARIABLES ----------

const segmentPadding = 10; // width padding, that text gets when its put in a box 
const nodeHeight = 30; // Height of the node rectancle
const nodeMargin = 10;

//fill it with Node information as soon as available, to avoid
//duplicate computations, Node Names serve as keys
let nodeDict = {};
let textWidthDict = {};

let biggestNodeWidth = 0;

export default function BTreePlot({ nodeData, highlightData, plotProps }) {

  // ---------- EFFECTS ----------

  // effect for cleanup of global variables
  useEffect(() => {
    // This is the cleanup function, runs when the component unmounts
    return () => {
      nodeDict = {};
      textWidthDict = {};
    };
  }, []);

  // ---------- FUNCTIONS ----------

  /**
   * Parses nodeData (all nodes), and clalculated the width in pixels. Set the biggest one found to the biggestNodeWidth global variable
   *
   * @param nodeData - nodeData
   */
  function NodeWithCalculations(nodeData) {
    if (nodeData.name.keys) {
      let [rectWidth, nodeSegmentWidth] = KeySetWidthCalculations(nodeData.name.keys);
      if (rectWidth > biggestNodeWidth) {
        biggestNodeWidth = rectWidth;
      }
    }
    if (nodeData.hasOwnProperty("children")) {
      for (let i = 0; i < nodeData.children.length; i++) {
        NodeWithCalculations(nodeData.children[i]);
      }
    }
  }

  /**
   * Calculate how much width a node, and each of its key sections need in pixels.
   *
   * @param keyStrings - Array String, representing the keys that the node holds
   * @return { Array } first value is the total width, second value is the width of each keysection
   */
  function KeySetWidthCalculations(keyStrings) {
    if (keyStrings) {
      // fill or use nodeDict to avoid duplicate Information
      let rectWidth, nodeSegmentWidth;
      if (!nodeDict.hasOwnProperty(keyStrings)) {
        const longestKeyWidth = Math.max(
          ...keyStrings.map((keyString) => textWidthCalculations(keyString))
        );
        rectWidth =
          longestKeyWidth * keyStrings.length +
          segmentPadding * keyStrings.length;
        nodeSegmentWidth = rectWidth / keyStrings.length;

        //once calculated store the values for the specific key string configuration in a lookup table, so they dont have to be computed twice.
        nodeDict[keyStrings] = {
          rectWidth: rectWidth,
          nodeSegmentWidth: nodeSegmentWidth,
        };
      } else {
        rectWidth = nodeDict[keyStrings].rectWidth;
        nodeSegmentWidth = nodeDict[keyStrings].nodeSegmentWidth;
      }
      return [rectWidth, nodeSegmentWidth];
    }
    return [0, 0];
  }

  /**
   * Calculates the width of a text. Caches the result in a hastable for subsequent calls.
   *
   * @param text - The text to calculate the width for. Can be a word or a number.
   *
   * @return { number } The width of the text in pixels
   */
  function textWidthCalculations(text) {
    if (!textWidthDict.hasOwnProperty(text)) {
      const span = document.createElement("span");
      span.style.font = "Arial Narrow";
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.textContent = text;
      document.body.appendChild(span);
      const width = span.clientWidth;
      document.body.removeChild(span);
      textWidthDict[text] = width;
    }
    return textWidthDict[text];
  }

  // CUSTOM NODE RENDERING FUNCTION
  const renderBTreeNode = ({ nodeDatum, toggleNode }) => {
    if (nodeDatum.name) {
      const keyStrings = nodeDatum.name.keys;
      const [rectWidth, nodeSegmentWidth] = KeySetWidthCalculations(keyStrings);

      //parse highlightdata
      const id = String(nodeDatum.name.id);
      let fullHighlight = false;
      let indexHighlights = [];
      let nodeMessage = "";
      let indexMessages = {};
      let separatorHighlights = [];
      let separatorMessages = {};

      if (highlightData.nodes.hasOwnProperty(id)) {
        fullHighlight = highlightData.nodes[id].fullHighlight;
        indexHighlights = highlightData.nodes[id].indexHighlights;
        nodeMessage = highlightData.nodes[id].nodeMessage;
        indexMessages = highlightData.nodes[id].indexMessages;
        separatorHighlights = highlightData.nodes[id].separatorHighlights;
        separatorMessages = highlightData.nodes[id].separatorMessages;
      }

      const nodeMessageWidth = textWidthCalculations(nodeMessage);

      // generate key-strings and separator lines elements
      const separator_elements = [];
      const key_elements = [];
      const index_message_elements = [];

      let xOffset = -rectWidth / 2;
      for (let i = 0; i < keyStrings.length; i++) {
        const doTextHighlight = indexHighlights.includes(i);
        const doSepHighlight =
          doTextHighlight || indexHighlights.includes(i - 1);
        const indexMessage = indexMessages.hasOwnProperty(i)
          ? indexMessages[i]
          : "";
        const separatorMessage = separatorMessages.hasOwnProperty(i)
          ? separatorMessages[i]
          : "";

        key_elements.push(
          <text
            className={
              doTextHighlight ? "key-text-highlighted" : "key-text-normal"
            }
            x={
              xOffset +
              nodeSegmentWidth / 2 -
              textWidthCalculations(keyStrings[i]) / 2
            }
            y={nodeHeight / 1.5}
            key={String(nodeDatum.name.keys) + "Text" + String(i)}
          >
            {keyStrings[i]}
          </text>
        );

        if (i != 0 || doSepHighlight || separatorHighlights.includes(i)) {
          separator_elements.push(
            <line
              key={`sep-${i}`}
              x1={xOffset}
              y1={0}
              x2={xOffset}
              y2={nodeHeight}
              className={
                doSepHighlight || separatorHighlights.includes(i)
                  ? "key-separator-highlighted"
                  : "key-separator-normal"
              }
            />
          );
        }

        //render highlight lines above and below the key aswell
        if (doTextHighlight) {
          separator_elements.push(
            // Line from the top of the separator to the right
            <line
              key={`sep-top-${i}`}
              x1={xOffset}
              y1={0}
              x2={xOffset + nodeSegmentWidth} // Adjust the length of the line as needed
              y2={0}
              className="key-separator-highlighted"
            />,
            // Line from the bottom of the separator to the right
            <line
              key={`sep-bottom-${i}`}
              x1={xOffset}
              y1={nodeHeight}
              x2={xOffset + nodeSegmentWidth} // Adjust the length of the line as needed
              y2={nodeHeight}
              className="key-separator-highlighted"
            />
          );
        }

        // Add Index Message
        if (indexMessage != "") {
          const indexMessageWidth = textWidthCalculations(indexMessage);
          const indexMessageOffsetX =
            xOffset + nodeSegmentWidth / 2 - (indexMessageWidth + 22) / 2;
          index_message_elements.push(
            <svg
              width={indexMessageWidth + 22}
              height={nodeHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={indexMessageOffsetX + 1}
              y={nodeHeight}
              className="message-bubble"
            >
              <rect
                x="1"
                y="10"
                width={indexMessageWidth + 20}
                height={nodeHeight}
                rx="10"
              />

              <polygon
                points={`${(indexMessageWidth + 20) / 2 - 5},${10} ${
                  (indexMessageWidth + 20) / 2 + 5
                },${10} ${(indexMessageWidth + 20) / 2},
                ${0}`}
              />

              <text
                x="11"
                y={nodeHeight / 1.5 + 10}
                className="message-bubble-text"
              >
                {indexMessage}
              </text>
            </svg>
          );
        }

        // Add Separator Message
        if (separatorMessage != "") {
          const separatorMessageWidth = textWidthCalculations(separatorMessage);
          const separatorMessageOffsetX =
            xOffset - (separatorMessageWidth + segmentPadding*2 + 2) / 2;
          index_message_elements.push(
            <svg
              width={separatorMessageWidth + segmentPadding*2 + 2}
              height={nodeHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={separatorMessageOffsetX + 1}
              y={nodeHeight}
              className="message-bubble"
            >
              <rect
                x="1"
                y="10"
                width={separatorMessageWidth + segmentPadding*2}
                height={nodeHeight}
                rx="10"
              />

              <polygon
                points={`${(separatorMessageWidth + segmentPadding*2) / 2 - 5},${10} ${
                  (separatorMessageWidth + segmentPadding*2) / 2 + 5
                },${10} ${(separatorMessageWidth + segmentPadding*2) / 2},
                ${0}`}
              />

              <text
                x="11"
                y={nodeHeight / 1.5 + 10}
                className="message-bubble-text"
              >
                {separatorMessage}
              </text>
            </svg>
          );
        }
        xOffset += nodeSegmentWidth;
      }

      //push a last separator, if the last element is supposed to be highlighted
      if (
        indexHighlights.includes(keyStrings.length - 1) ||
        separatorHighlights.includes(keyStrings.length)
      ) {
        separator_elements.push(
          <line
            key={`sep-${keyStrings.length}`}
            x1={xOffset}
            y1={0}
            x2={xOffset}
            y2={nodeHeight}
            className="key-separator-highlighted"
          />
        );
      }

      // push a last separator Message if specified
      if (separatorMessages.hasOwnProperty(keyStrings.length)) {
        const separatorMessage = separatorMessages[keyStrings.length];

        const separatorMessageWidth = textWidthCalculations(separatorMessage);
        const separatorMessageOffsetX =
          xOffset - (separatorMessageWidth + segmentPadding*2 + 2) / 2;
        index_message_elements.push(
          <svg
            width={separatorMessageWidth + segmentPadding*2  + 2}
            height={nodeHeight + 10}
            xmlns="http://www.w3.org/2000/svg"
            x={separatorMessageOffsetX + 1}
            y={nodeHeight}
            className="message-bubble"
          >
            <rect
              x="1"
              y="10"
              width={separatorMessageWidth + segmentPadding*2 }
              height={nodeHeight}
              rx="10"
            />

            <polygon
              points={`${(separatorMessageWidth + segmentPadding*2 ) / 2 - 5},${10} ${
                (separatorMessageWidth + segmentPadding*2 ) / 2 + 5
              },${10} ${(separatorMessageWidth + segmentPadding*2 ) / 2},
              ${0}`}
            />

            <text
              x="11"
              y={nodeHeight / 1.5 + 10}
              className="message-bubble-text"
            >
              {separatorMessage}
            </text>
          </svg>
        );
      }

      return (
        <g>
          {/* NODE  */}
          <rect
            width={rectWidth}
            height={nodeHeight}
            x={-rectWidth / 2}
            key={String(nodeDatum.name.keys)}
            className={fullHighlight ? "node-highlighted" : "node-normal"}
          />
          {separator_elements}
          {key_elements}
          {index_message_elements}

          {/* NODE MESSAGE TOOLTIP */}
          {nodeMessage && (
            <svg
              width={nodeMessageWidth + segmentPadding*2 + 2}
              height={nodeHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={(nodeMessageWidth + segmentPadding*2  + 2) / -2}
              y={-nodeHeight - 10}
              className="message-bubble"
            >
              <rect
                x="1"
                y="1"
                width={nodeMessageWidth + segmentPadding*2 }
                height={nodeHeight}
                rx="10"
              />

              <polygon
                points={`${(nodeMessageWidth + segmentPadding*2 ) / 2 - 5},${nodeHeight + 1} ${
                  (nodeMessageWidth + segmentPadding*2 ) / 2 + 5
                },${nodeHeight + 1} ${(nodeMessageWidth + segmentPadding*2 ) / 2},${
                  nodeHeight + 10
                }`}
              />

              <text x="11" y={nodeHeight / 1.5} className="message-bubble-text">
                {nodeMessage}
              </text>
            </svg>
          )}
        </g>
      );
    }
  };

  // CUSTOM ANCHOR POINTS FOR TREE EDGES
  const bTreePathFunc = ({ source, target }, orientation) => {
    const [rectWidth, nodeSegmentWidth] = KeySetWidthCalculations(
      source.data.name.keys
    );

    let xOffset = -rectWidth / 2;
    //if target is the nth child, move anchor to the right by n*nodeSegmentWidth
    const sourceChildrenNames = source.children.map(function (node) {
      return node.data.name.keys;
    });
    const targetIndex = sourceChildrenNames.indexOf(target.data.name.keys);
    xOffset += nodeSegmentWidth * targetIndex;

    return (
      `M${source.x + xOffset},${source.y + nodeHeight}` + //source anchor
      `L${target.x},${target.y}`
    ); //target anchor
  };

  // CUSTOM LINK HIGHLIGHTING applies styles dynamically
  const getDynamicPathClass = ({ source, target }, orientation) => {
    const edgeId = String(source.data.name.id) + String(target.data.name.id);
    if (highlightData.edges.hasOwnProperty(edgeId)) {
      if (highlightData.edges[edgeId].fullHighlight == true) {
        return "link-orange-highlighted";
      }
      else{
        return "link-blue-highlighted"
      }
    }

    return "link-normal";
  };

  biggestNodeWidth = 0;
  NodeWithCalculations(nodeData);


  // ---------- JSX ----------

  return (
    <Tree
      data={nodeData}
      orientation="vertical"
      collapsible={false}
      scaleExtent={{ max: 5, min: 0.05 }}
      separation={{ nonSiblings: 1, siblings: 1 }}
      translate={{ x: plotProps.plotWidth / 2, y: plotProps.plotHeight / 4 }}
      zoom={1.25}
      renderCustomNodeElement={renderBTreeNode}
      pathFunc={bTreePathFunc}
      pathClassFunc={getDynamicPathClass}
      nodeSize={{ x: biggestNodeWidth + nodeMargin, y: nodeHeight * 3 }}
      
    />
  );
}
