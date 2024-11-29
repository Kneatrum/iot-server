import React, { useEffect, useState, useRef } from "react";
import styles from "./styles/optionsmodal.module.css";
import { api } from "../api/api";

const OptionsModal = ({ deviceSerialNumber, tabRef, onClose, options, actions }) => {
  const [ position, setPosition ] = useState(null); // Start as `null` instead of { top: 0, left: 0 }
  const modalRef = useRef(null); // Ref for the modal container

  // Calculate the position of the modal based on the three-dot button's position
  useEffect(() => {
    const calculatePosition = () => {
      if (tabRef && tabRef.current) {
        const rect = tabRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom - 34, // Align with the bottom of the dots
          left: rect.right + 2, // Place slightly to the right of the dots
        });
      }
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("resize", calculatePosition);
    };
  }, [tabRef]);

  // Close the modal if the user clicks outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        tabRef.current &&
        !tabRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tabRef, onClose]);

  // Don't render the modal until the position is calculated
  if (!position) {
    return null;
  }

  const handleOptionClick = (option, index) => {
    console.log(`Option clicked: ${option}, Index: ${index}`);
    // Add custom logic for the option here
    if (option === "Edit") {
      console.log("Edit action triggered!");
    } else if (option === "Delete") {
        if(deleteDevice(deviceSerialNumber)){
            actions(option, deviceSerialNumber)
            onClose();
        }
        console.log("Delete action triggered!");
    } else {
      console.log(`Action for ${option} is not defined`);
    }
  };


  async function deleteDevice(serialNumber) {
    try {
      console.log("Serial Number: ", serialNumber);
      const response = await api.delete(`/delete-device/${serialNumber}`);
      console.log(response.data);
      return true; // Return true if the deletion was successful
    } catch (error) {
      console.log("Failed to delete");
      console.error('Error details:', error.message);
      return false; // Return false if the deletion failed
    }
  }
  
  

  return (
    <div
      className={styles.overlay}
      style={{
        "--dynamic-top": `${position.top}px`,
        "--dynamic-left": `${position.left}px`,
      }}
    >
      <div className={styles.modal} ref={modalRef}>
        <ul className={styles.list}>
          {options.map((option, index) => (
            <li key={index} className={styles.item} onClick={() => handleOptionClick(option, index)}>
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OptionsModal;
