import React from "react";
import UiComponent from "../UiComponent";
import "./BTreeProperties.css" 

const TreeProperties = ({ treeProps, toggleUiComponentDisplay}) => {
  const propertyRows = [
    { label: "Height", value: treeProps.height },
    { label: "Nodes", value: treeProps.nNodes },
    { label: "Keys", value: treeProps.nKeys },
    { label: "Filling Degree", value: (treeProps.fillingDegree * 100).toFixed(0) + "%" },
    { label: "Splits", value: treeProps.splits },
    { label: "Merges", value: treeProps.merges },
    { label: "Small Rotations", value: treeProps.smallRotations },
    { label: "Big Rotations", value: treeProps.bigRotations },
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

export default TreeProperties;
