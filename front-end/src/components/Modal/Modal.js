import React, { useState } from 'react';
import styles from '../styles/modal.module.css';
import TopicsLayout from './TopicsLayout';
import { ReactComponent as CancelIcon } from '../../assets/cancel.svg'

const Modal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["MQTT", "CoAP", "AMQP", "WebSockets"];

  const tabContent = [
    <TopicsLayout userTopics={mqttTopics} />,
    "",
    "",
    ""
  ];

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Data Sources</h3>
          <CancelIcon className={styles.cancelIcon} onClick={onClose}/>
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
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default Modal;
