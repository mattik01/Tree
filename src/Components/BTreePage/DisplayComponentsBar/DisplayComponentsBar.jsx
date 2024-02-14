import "./DisplayComponentsBar.css";

// libraries
import React, { useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

/**
 * Component that renders the small bar below the Navbar, where UI Window visibility can be toggled
 */

const DisplayComponentsBar = ({
  displayUiComponents,
  setDisplayUiComponents
}) => {
  const handleDisplayChange = (event, newDisplays) => {
    setDisplayUiComponents(newDisplays);
  };

  return (
    <div className="toggle-navbar">
      <ToggleButtonGroup
        size="medium"
        value={displayUiComponents}
        onChange={handleDisplayChange}
        aria-label="ui-component-display-toggle"
        style={{ width: "100%" }}
      >
        <ToggleButton value={"inputForm"} className="custom-display-toggle-button">
          Input Form
        </ToggleButton>
        <ToggleButton value={"sequenceControl"} className="custom-display-toggle-button">
          Sequence Control
        </ToggleButton>
        <ToggleButton value={"treeProperties"} className="custom-display-toggle-button">
          Tree Properties
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default DisplayComponentsBar;
