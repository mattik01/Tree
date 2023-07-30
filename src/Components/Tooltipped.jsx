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
        <span
          style={{
            position: "absolute",
            top: "-15px",
            right: "-10px",
            padding: "4px",
            zIndex: "1",
            fontSize: "14px",
          }}
        >
          &#8505;
        </span>
        {children}
      </Tooltip>
    </div>
  );
};

export default Tooltipped;
