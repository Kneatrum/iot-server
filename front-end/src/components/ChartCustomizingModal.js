import React, { useState, useRef, useEffect } from "react";
import styles from '../components/styles/chart-customizing-modal.module.css';
import LineCustomizer from "./ChartCustomization/LineCustomizer";

const ChartCustomizingModal = ({ 
    setCustomizeChartModal, 
    dataSources,
    activeDevice,
    modalPosition
  }) => {
    
  const modalRef = useRef(null);
  const [position, setPosition] = useState({x: modalPosition.x , y: modalPosition.y }); // Initial position
  const [size, setSize] = useState({ width: 400, height: 300 }); // Initial size
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Store the initial mouse position when starting to drag
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });

  // Start dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Store the initial mouse position relative to the entire page
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle drag movement
  const handleMouseMove = (e) => {
    if (isDragging) {
      // Calculate new position based on the initial drag start point
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (isResizing) {
      // Calculate new size based on the initial resize start point
      setSize({
        width: size.width + (e.clientX - resizeStart.x),
        height: size.height + (e.clientY - resizeStart.y)
      });
      
      // Update the resize start point for smooth resizing
      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Stop dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Start resizing
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };



  // Attach mouse events globally
  useEffect(() => {
    // Only add listeners when dragging or resizing
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <>
    { 
        <div
        ref={modalRef}
        style={{
            position: "absolute",
            top: position.y,
            left: position.x,
            width: size.width,
            height: size.height,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
        }}
        >
        
            
        {/* Modal Header (Drag Handle) */}
        <div
            onMouseDown={handleMouseDown}
            style={{
            cursor: "move",
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderBottom: "1px solid #ccc",
            userSelect: "none", // Prevent text selection
            }}
        >
            <h3 style={{ margin: 0 }}>Customize Chart Options</h3>
        </div>

        {/* Modal Content */} 
        <div style={{ flex: 1, overflow: "hidden" }}>
          <LineCustomizer
            dataSources={dataSources}
            activeDevice={activeDevice}
            onClose={() => setCustomizeChartModal(false)}
          />
        </div>

        {/* Resize Handle */}
        <div
            onMouseDown={handleResizeMouseDown}
            style={{
            width: "10px",
            height: "10px",
            backgroundColor: "#ccc",
            position: "absolute",
            bottom: 0,
            right: 0,
            cursor: "nwse-resize",
            }}
        ></div>
        
        </div>
    }
    </>
  );
};

export default ChartCustomizingModal;