import React, { useState } from 'react';
import './Navbar.css';

export default function Navbar ({ selectedSegment, onSegmentClick }) {
  const handleSegmentClick = (segment) => {
    onSegmentClick(segment);
  };

  return (
    <nav className='Navbar'>
      <div className="logo">Tree Visualizer</div>
      <div className="segments">
        <div
          className={`segment ${selectedSegment === 'B-Tree' ? 'selected' : ''}`}
          onClick={() => handleSegmentClick('B-Tree')}
        >
          B-Tree
        </div>
        <div
          className={`segment ${selectedSegment === 'Test' ? 'selected' : ''}`}
          onClick={() => handleSegmentClick('Test')}
        >
          Test
        </div>
      </div>
    </nav>
  );
};