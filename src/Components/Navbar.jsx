import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ selectedSegment, onSegmentClick }) {
  const handleSegmentClick = (segment) => {
    onSegmentClick(segment);
  };

  return (
    <nav className="Navbar">
      <div className="title">Tree Visualizer</div>
      <div className="segments">
        <div
          className={`segment ${
            selectedSegment === "B-Tree" ? "selected" : ""
          }`}
          onClick={() => handleSegmentClick("B-Tree")}
        >
          <span className="segment-text">B-TREE</span>
        </div>
        <div
          className={`segment ${selectedSegment === "Info" ? "selected" : ""}`}
          onClick={() => handleSegmentClick("Info")}
        >
         <span className="segment-text">INFO</span>
        </div>
      </div>
      <img
        className="navbar-logo"
        src="/Tree-Visualizer-Logo.svg"
        alt="Tree Visualizer Logo"
        width="50px"
      />
    </nav>
  );
}
