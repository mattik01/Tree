import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ selectedSegment, onSegmentClick }) {
  const handleSegmentClick = (segment) => {
    onSegmentClick(segment);
  };

  return (
    <nav className="Navbar">
      <div className="logo">Tree Visualizer</div>
      <div className="segments">
        <div
          className={`segment ${
            selectedSegment === "B-Tree" ? "selected" : ""
          }`}
          onClick={() => handleSegmentClick("B-Tree")}
        >
          B-Tree
        </div>
        <div
          className={`segment ${selectedSegment === "Info" ? "selected" : ""}`}
          onClick={() => handleSegmentClick("Info")}
        >
          Info
        </div>
      </div>
      <img
        className="navbar-logo"
        src="../../public/Tree-Visualizer-Logo.svg"
        alt="Tree Visualizer Logo"
        width="50px"
      />
    </nav>
  );
}
