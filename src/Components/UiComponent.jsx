import React from 'react';
import './UiComponent.css';

import DraggableIcon from '/draggable-icon.png';

const UiComponent = ({ title, children, toggleWindow }) => {
  return (
    <div className="ui-component">
      {/* DRAG ICON SEGMENT */}
      <div className="draggable-icon-container">
        <img src={DraggableIcon} className="draggable-icon" draggable={false} />
        <h4 className="ui-title">{title}</h4>
        <button className="ui-close-button" onClick={toggleWindow}>
          &#x2715; {/* Unicode character for close cross */}
        </button>
      </div>
      {children}
    </div>
  );
};

export default UiComponent;
