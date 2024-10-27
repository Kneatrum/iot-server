import React, { useState } from 'react';
import styles from '../styles/modal.module.css';
import TopicsLayout from './TopicsLayout';

const Modal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["MQTT", "CoAP", "AMQP", "WebSockets"];

  const tabContent = [
    "",
    "",
    "",
    ""
  ];

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Data Sources</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.tabBar}>
          {tabs.map((tab, index) => (
            <div 
              key={index} 
              className={`${styles.tabItem} ${activeTab === index ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className={styles.tabContent}>
            {/* {tabContent[activeTab]} */}
            <TopicsLayout/>
        </div>
      </div>
    </div>
  );
};

export default Modal;
