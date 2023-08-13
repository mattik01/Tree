import React, { useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import "./DisplayComponentsBar.css"


  const handleFormat = (event, newFormats) => {
    
  };


const DisplayComponentsBar = ({
  displayUiComponents,
  setDisplayUiComponents
}) => {

  const handleDisplayChange = (event, newDisplays) => {
    setDisplayUiComponents(newDisplays);
  };

  return (
    <ToggleButtonGroup
      size="medium"
      value={displayUiComponents}
      onChange={handleDisplayChange}
      aria-label="ui-component-display-toggle"
    >
      <ToggleButton
        value={"inputForm"}
        className="custom-display-toggle-button"
      >
        Input Form
      </ToggleButton>
      ,
      <ToggleButton 
        value={"sequenceControl"}
        className="custom-display-toggle-button"
        >
        Sequence Control
      </ToggleButton>
      ,
      <ToggleButton 
        value={"treeProperties"}
        className="custom-display-toggle-button"
        >
        Tree Properties
      </ToggleButton>
      ,
    </ToggleButtonGroup>
  );
};

export default DisplayComponentsBar;
