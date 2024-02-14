import "./UiComponent.css";

// libraries
import React from "react";
import DraggableIcon from "/draggable-icon.png";

/**
 * Warp any visible Component with this Component to turn it into an UI Window.
 * -> light grey transparent background, a title, closing cross button and an Icon indicating that the window is draggable
 */
const UiComponent = ({ title, children, toggleWindow }) => {
  return (
    <div className="ui-component">
      {/* DRAG ICON SEGMENT */}
      <div className="draggable-icon-container">
        <img src={DraggableIcon} className="draggable-icon" draggable={false} />
        <h4 className="ui-title">{title}</h4>
        <button className="ui-close-button" onClick={toggleWindow}>
          &#x2715;
        </button>
      </div>
      {children}
    </div>
  );
};

export default UiComponent;
