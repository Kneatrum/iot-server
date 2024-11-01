import React, { useState } from 'react';
import styles from '../styles/toolbar.module.css';
import { ReactComponent as AddSVGIcon } from '../../assets/add.svg';
import NewDevice from '../NewDeviceModal';

function DeviceToolbar({isCollapsed}) {
  // State to manage the list of added devices
  const [ devices, setDevices ] = useState(["Devices"]);
  const [ activeTab, setActiveTab ] = useState(1);
  const [ addStatus, setAddStatus ] = useState(true);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  
  
  // Function to add a new device
  const addDevice = () => {
    // setAddStatus(false);
    setIsModalOpen(true);
    // Use the current timestamp to create a unique device ID
    // const newDevice = `Device ${devices.length}` ;
    // setDevices([...devices, newDevice]);
  };

  return (
    <div className={`${styles.toolbarContainer} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded }`}>
    
      <div className={styles.toolbarHeader}>
          {devices.map((device, index) => (
            <div 
              key={index} 
              className={`${styles.toolbarItem} ${activeTab === index ? styles.toolbarItemActive : ''} ${index === 0 ? styles.toolbarItemDescription : ''}`}
              onClick={() => {
                if(index === 0){
                  setActiveTab(1);
                } else {
                  setActiveTab(index)
                }
              }}
            >
              {device}
            </div>
          ))}
      </div>
      {addStatus ? <div className={styles.addDeviceButton}> <AddSVGIcon className={styles.addSVGIcon} onClick={addDevice} /> </div> : ''}
      { isModalOpen ? <NewDevice isOpen={isModalOpen} onClose={() => setIsModalOpen(false) } setAddStatus={setAddStatus} setDevices={setDevices}/> : ''} 
    </div>
  );
}

export default DeviceToolbar;
