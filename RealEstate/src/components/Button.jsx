import React from "react";

/**
 * Reusable Button component.
 * Props: children, onClick, type (defaults to "button"), className
 */
export default function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button className={`btn ${className}`} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
