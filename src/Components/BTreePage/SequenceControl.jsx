import React, { useState } from "react";
import UiComponent from "../UiComponent";
import "./SequenceControl.css";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import Stack from "@mui/material/Stack";
import { drag } from "d3";
import Draggable from "react-draggable";

const SequenceControl = ({
  sequencerProps,
  setSequencerProps,
  setAllowDrag,
}) => {
  const handleModeChange = (event, newMode) => {
    setSequencerProps((prevProps) => ({
      ...prevProps,
      sequenceMode: newMode,
    }));
  };

  const handleSpeedChange = (event) => {
    setSequencerProps((prevProps) => ({
      ...prevProps,
      sequenceSpeed: parseFloat(event.target.value),
    }));
  };

  const handleDirectionChange = (direction) => {
    setSequencerProps((prevProps) => ({
      ...prevProps,
      doForward: direction === "forward",
      doBackward: direction === "backward",
      inSequence: true,
    }));
  };

  return (
    <UiComponent
      title="Sequence Control"
      children={
        <div className="sequence-control-container">
          {/* MODE SELECT SEGMENT */}
          <div className="sequence-control-segment">
            <div className="sequence-mode-selection">
              <ToggleButtonGroup
                size="medium"
                value={sequencerProps.sequenceMode}
                onChange={handleModeChange}
                exclusive={true}
                aria-label="sequence-mode-select"
              >
                <ToggleButton
                  value="instant"
                  key="instant"
                  className="custom-toggle-button"
                >
                  instant
                </ToggleButton>
                ,
                <ToggleButton
                  value="auto"
                  key="auto"
                  className="custom-toggle-button"
                >
                  auto
                </ToggleButton>
                ,
                <ToggleButton
                  value="step"
                  key="step"
                  className="custom-toggle-button"
                >
                  step
                </ToggleButton>
                ,
              </ToggleButtonGroup>
            </div>
          </div>
          {/* CONTROL SEGMENT */}
          {sequencerProps.sequenceMode === "auto" && (
            <div className="speed-container">
              <label className="speed-label">Speed:</label>
              <input
                onMouseEnter={() => setAllowDrag(false)}
                onMouseLeave={() => setAllowDrag(true)}
                className="speed-input"
                type="range"
                min="0.1"
                max="1.9"
                step="0.1"
                value={sequencerProps.sequenceSpeed}
                onChange={handleSpeedChange}
              />
            </div>
          )}
          {sequencerProps.sequenceMode === "step" && (
            <div className="step-container">
              <button
                className="direction-button"
                onClick={() => handleDirectionChange("backward")}
                disabled={!sequencerProps.hasPrevious}
              >
                Backward ⬅️
              </button>
              <button
                className="direction-button"
                onClick={() => handleDirectionChange("forward")}
                disabled={!sequencerProps.inSequence}
              >
                ➡️ Forward
              </button>
            </div>
          )}

          {/* SEQUENCE DISPLAY SEGMENT */}
          {sequencerProps.keyQueue && (
            <div className="sequence-display-segment">
              {sequencerProps.keyQueue.length > 0 && (
                <div>
                  <span>next: </span>
                  <span className="next-key-text">
                    {sequencerProps.keyQueue[0][0] === "add" ? "+" : "-"}
                    {sequencerProps.keyQueue[0][1]}
                  </span>{" "}
                </div>
              )}

              {sequencerProps.keyQueue.slice(1, 5).length > 0 && (
                <div>
                  {sequencerProps.keyQueue.slice(1, 5).map((entry, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && ", "}
                      {entry[0] === "add" ? "+" : "-"}
                      {entry[1]}
                    </React.Fragment>
                  ))}
                  {sequencerProps.keyQueue.length > 5 && (
                    <span>
                      , ... ({sequencerProps.keyQueue.length - 5})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      }
    />
  );
};

export default SequenceControl;
