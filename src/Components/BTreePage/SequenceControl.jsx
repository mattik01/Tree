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
    }));
  };

  return (
    <UiComponent
      title="Sequence Control"
      children={
        /* MODE SELECT SEGMENT */
        <div className="sequence-control-container">
          <div className="sequence-control-segment">
            <div className="sequence-mode-selection">
              <ToggleButtonGroup
                size="medium"
                value={sequencerProps.sequenceMode}
                onChange={handleModeChange}
                exclusive="true"
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
        </div>
      }
    />
  );
};

export default SequenceControl;
