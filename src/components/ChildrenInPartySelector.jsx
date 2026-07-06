import React from 'react';

export default function ChildrenInPartySelector({ hasChildren, onChange }) {
  return (
    <div className="time-selector">
      <label>Are there children in your party?</label>
      <div className="price-options">
        <button
          className={`price-btn ${hasChildren === true ? 'selected' : ''}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          className={`price-btn ${hasChildren === false ? 'selected' : ''}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}
