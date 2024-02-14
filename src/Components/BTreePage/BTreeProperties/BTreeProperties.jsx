import "./BTreeProperties.css" 

//libraries
import React from "react";

//components
import UiComponent from "../../utility-components/UiComponent";

/**
 * Component that renders the B-Tree Properties Window, where attributes of the B-Tree are displayed. 
 */

const BTreeProperties = ({ treeProps, counters, toggleUiComponentDisplay}) => {
  const propertyRows = [
    { label: "Height", value: treeProps.height },
    { label: "Nodes", value: treeProps.nNodes },
    { label: "Keys", value: treeProps.nKeys },
    { label: "Filling Degree", value: (treeProps.fillingDegree * 100).toFixed(0) + "%" },
    { label: "Splits", value: counters.splits },
    { label: "Merges", value: counters.merges },
    { label: "Small Rotations", value: counters.smallRotations },
    { label: "Big Rotations", value: counters.bigRotations },
  ];

  const firstSegmentRows = propertyRows.slice(0, 4);
  const secondSegmentRows = propertyRows.slice(4);

  return (
    <UiComponent title="B-Tree Properties" toggleWindow={() => toggleUiComponentDisplay("treeProperties")}>
      <div>
        <div className="btree-properties-segment">
          {firstSegmentRows.map((row, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{row.label}:</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
        <div className="btree-balancing-segment">
          {secondSegmentRows.map((row, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{row.label}:</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </UiComponent>
  );
};

export default BTreeProperties;
