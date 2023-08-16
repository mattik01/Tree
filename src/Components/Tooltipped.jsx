import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

const Tooltipped = ({ children, tooltipText }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Tooltip
        title={tooltipText}
        placement="top"
        TransitionComponent={Zoom}
        arrow
      >
        <div>
          <span
            style={{
              position: "absolute",
              top: "-14px",
              right: "-11px",
              padding: "4px",
              zIndex: "1",
              fontSize: "14px",
              color: "grey"
            }}
          >
            &#8505;
          </span>
          {children}
        </div>
      </Tooltip>
    </div>
  );
};

export default Tooltipped;
