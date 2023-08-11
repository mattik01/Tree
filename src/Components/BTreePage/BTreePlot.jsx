import { Tree } from "react-d3-tree";
import React, { useState, useEffect } from "react";

import "./BTreePlot.css";
import { tree } from "d3";

// ---------- GLOBAL VARIABLES ----------

const extraRectWidth = 10;
const rectHeight = 30; // Height of the rectangle in pixels

//fill it with Node information as soon as available, to avoid
//duplicate computations, Node Names serve as keys
let nodeDict = {};

//avoid duiplicate calculations
let textWidthDict = {};

let biggestNodeWidth = 0;

export default function BTreePlot({ treeData, highlights, plotProps }) {
  // ---------- STATE VARIABLES ----------

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

  function setBiggestNodeWith(treeData) {
    if (treeData.name.keys) {
      let [rectWidth, sub_node_width] = widthCalculations(treeData.name.keys);
      if (rectWidth > biggestNodeWidth) {
        biggestNodeWidth = rectWidth;
      }
    }
    if (treeData.hasOwnProperty("children")) {
      for (let i = 0; i < treeData.children.length; i++) {
        setBiggestNodeWith(treeData.children[i]);
      }
    }
  }

  function getTextWidth(text, font) {
    const span = document.createElement("span");
    span.style.font = font;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.clientWidth;
    document.body.removeChild(span);
    return width;
  }

  function textWidthCalculations(text) {
    if (!textWidthDict.hasOwnProperty(text)) {
      textWidthDict[text] = getTextWidth(text, "Courier");
    }
    return textWidthDict[text];
  }

  //returns node_with and subnode with for a node key
  function widthCalculations(keyStrings) {
    if (keyStrings) {
      // fill or use nodeDict to avoid duplicate Information
      let rectWidth, sub_node_width;
      if (!nodeDict.hasOwnProperty(keyStrings)) {
        const longestKeyWidth = Math.max(
          ...keyStrings.map((keyString) => textWidthCalculations(keyString))
        );
        rectWidth =
          longestKeyWidth * keyStrings.length +
          extraRectWidth * keyStrings.length;
        sub_node_width = rectWidth / keyStrings.length;
        nodeDict[keyStrings] = {
          rectWidth: rectWidth,
          sub_node_width: sub_node_width,
        };
      } else {
        rectWidth = nodeDict[keyStrings].rectWidth;
        sub_node_width = nodeDict[keyStrings].sub_node_width;
      }
      return [rectWidth, sub_node_width];
    }
    return [0, 0];
  }

  //Customized Node rendering
  const renderBTreeNode = ({ nodeDatum, toggleNode }) => {
    if (nodeDatum.name) {
      const keyStrings = nodeDatum.name.keys;
      const [rectWidth, sub_node_width] = widthCalculations(keyStrings);

      //read out highlights
      const id = String(nodeDatum.name.id);
      let fullHighlight = false;
      let indexHighlights = [];
      let nodeMessage = "";
      let indexMessages = {};
      let separatorHighlights = [];
      let separatorMessages = {};

      if (highlights.nodes.hasOwnProperty(id)) {
        fullHighlight = highlights.nodes[id].fullHighlight;
        indexHighlights = highlights.nodes[id].indexHighlights;
        nodeMessage = highlights.nodes[id].nodeMessage;
        indexMessages = highlights.nodes[id].indexMessages;
        separatorHighlights = highlights.nodes[id].separatorHighlights;
        separatorMessages = highlights.nodes[id].separatorMessages;
      }

      const nodeMessageWidth = getTextWidth(nodeMessage, "Courier");

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
              sub_node_width / 2 -
              textWidthCalculations(keyStrings[i]) / 2
            }
            y={rectHeight / 1.5}
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
              y2={rectHeight}
              className={
                doSepHighlight || separatorHighlights.includes(i)
                  ? "key-separator-highlighted"
                  : "key-separator-normal"
              }
            />
          );
        }

        //render lines above and below the key aswell
        if (doTextHighlight) {
          separator_elements.push(
            // Line from the top of the separator to the right
            <line
              key={`sep-top-${i}`}
              x1={xOffset}
              y1={0}
              x2={xOffset + sub_node_width} // Adjust the length of the line as needed
              y2={0}
              className="key-separator-highlighted"
            />,
            // Line from the bottom of the separator to the right
            <line
              key={`sep-bottom-${i}`}
              x1={xOffset}
              y1={rectHeight}
              x2={xOffset + sub_node_width} // Adjust the length of the line as needed
              y2={rectHeight}
              className="key-separator-highlighted"
            />
          );
        }

        // Add Index Message
        if (indexMessage != "") {
          const indexMessageWidth = getTextWidth(indexMessage, "Courier");
          const indexMessageOffsetX =
            xOffset + sub_node_width / 2 - (indexMessageWidth + 22) / 2;
          index_message_elements.push(
            <svg
              width={indexMessageWidth + 22}
              height={rectHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={indexMessageOffsetX + 1}
              y={rectHeight}
              className="message-bubble"
            >
              <rect
                x="1"
                y="10"
                width={indexMessageWidth + 20}
                height={rectHeight}
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
                y={rectHeight / 1.5 + 10}
                className="message-bubble-text"
              >
                {indexMessage}
              </text>
            </svg>
          );
        }

        // Add Separator Message
        if (separatorMessage != "") {
          const separatorMessageWidth = getTextWidth(
            separatorMessage,
            "Courier"
          );
          const separatorMessageOffsetX =
            xOffset - (separatorMessageWidth + 22) / 2;
          index_message_elements.push(
            <svg
              width={separatorMessageWidth + 22}
              height={rectHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={separatorMessageOffsetX + 1}
              y={rectHeight}
              className="message-bubble"
            >
              <rect
                x="1"
                y="10"
                width={separatorMessageWidth + 20}
                height={rectHeight}
                rx="10"
              />

              <polygon
                points={`${(separatorMessageWidth + 20) / 2 - 5},${10} ${
                  (separatorMessageWidth + 20) / 2 + 5
                },${10} ${(separatorMessageWidth + 20) / 2},
                ${0}`}
              />

              <text
                x="11"
                y={rectHeight / 1.5 + 10}
                className="message-bubble-text"
              >
                {separatorMessage}
              </text>
            </svg>
          );
        }
        xOffset += sub_node_width;
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
            y2={rectHeight}
            className="key-separator-highlighted"
          />
        );
      }

      // push a last separator Message if specified
      if (separatorMessages.hasOwnProperty(keyStrings.length)) {
        const separatorMessage = separatorMessages[keyStrings.length];

        const separatorMessageWidth = getTextWidth(separatorMessage, "Courier");
        const separatorMessageOffsetX =
          xOffset - (separatorMessageWidth + 22) / 2;
        index_message_elements.push(
          <svg
            width={separatorMessageWidth + 22}
            height={rectHeight + 10}
            xmlns="http://www.w3.org/2000/svg"
            x={separatorMessageOffsetX + 1}
            y={rectHeight}
            className="message-bubble"
          >
            <rect
              x="1"
              y="10"
              width={separatorMessageWidth + 20}
              height={rectHeight}
              rx="10"
            />

            <polygon
              points={`${(separatorMessageWidth + 20) / 2 - 5},${10} ${
                (separatorMessageWidth + 20) / 2 + 5
              },${10} ${(separatorMessageWidth + 20) / 2},
              ${0}`}
            />

            <text
              x="11"
              y={rectHeight / 1.5 + 10}
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
            height={rectHeight}
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
              width={nodeMessageWidth + 22}
              height={rectHeight + 10}
              xmlns="http://www.w3.org/2000/svg"
              x={(nodeMessageWidth + 22) / -2}
              y={-rectHeight - 10}
              className="message-bubble"
            >
              <rect
                x="1"
                y="1"
                width={nodeMessageWidth + 20}
                height={rectHeight}
                rx="10"
              />

              <polygon
                points={`${(nodeMessageWidth + 20) / 2 - 5},${rectHeight + 1} ${
                  (nodeMessageWidth + 20) / 2 + 5
                },${rectHeight + 1} ${(nodeMessageWidth + 20) / 2},${
                  rectHeight + 10
                }`}
              />

              <text x="11" y={rectHeight / 1.5} className="message-bubble-text">
                {nodeMessage}
              </text>
            </svg>
          )}
        </g>
      );
    }
  };

  //Customizes anchor points of the edges
  const bTreePathFunc = ({ source, target }, orientation) => {
    const [rectWidth, sub_node_width] = widthCalculations(
      source.data.name.keys
    );

    let xOffset = -rectWidth / 2;
    //if target is the nth child, move anchor to the right by n*subnode_width
    const sourceChildrenNames = source.children.map(function (node) {
      return node.data.name.keys;
    });
    const targetIndex = sourceChildrenNames.indexOf(target.data.name.keys);
    xOffset += sub_node_width * targetIndex;

    return (
      `M${source.x + xOffset},${source.y + rectHeight}` + //source anchor
      `L${target.x},${target.y}`
    ); //target anchor
  };

  //Customizes styling of links dynmaically
  const getDynamicPathClass = ({ source, target }, orientation) => {
    const edgeId = String(source.data.name.id) + String(target.data.name.id);
    if (highlights.edges.hasOwnProperty(edgeId)) {
      if (highlights.edges[edgeId].fullHighlight == true) {
        return "link__highlighted";
      }
    }

    return "link__normal";
  };

  biggestNodeWidth = 0;
  setBiggestNodeWith(treeData);

  // ---------- JSX ----------

  return (
    <Tree
      data={treeData}
      orientation="vertical"
      collapsible={false}
      renderCustomNodeElement={renderBTreeNode}
      pathFunc={bTreePathFunc}
      pathClassFunc={getDynamicPathClass}
      nodeSize={{ x: biggestNodeWidth + 10, y: rectHeight * 3 }}
      scaleExtent={{ max: 5, min: 0.05 }}
      separation={{ nonSiblings: 1, siblings: 1 }}
      translate={{ x: plotProps.plotWidth / 2, y: plotProps.plotHeight / 4 }}
      zoom={1.5}
    />
  );
}
