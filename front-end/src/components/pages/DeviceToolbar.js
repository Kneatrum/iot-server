import React, { useEffect, useState } from 'react';
import styles from '../styles/toolbar.module.css';
import { ReactComponent as AddSVGIcon } from '../../assets/add.svg';
import NewDeviceModal from '../NewDeviceModal';
import api from '../../api/api';

function DeviceToolbar({isCollapsed, mqttTopics}) {
  // State to manage the list of added devices
  const [ devices, setDevices ] = useState(["Devices"]);
  const [ activeTab, setActiveTab ] = useState(1);
  const [ addStatus, setAddStatus ] = useState(true);
  const [ isModalOpen, setIsModalOpen ] = useState(false);

  useEffect(() => {
    api.get('/device_names')
    .then(response => {
        // setLoading(false);
        console.log(response.data);
        // setAddStatus(true); // update status if needed
        // setSuccess(true);
        setDevices([...devices, response.data]);
        // onClose();
        
    })
    .catch(error => {
        console.log("Failed to delete")
        console.error('Error fetching data:', error.message);
        // setLoading(false);
        // setFailed(true);
    });

  }, [])
  
  
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
      { isModalOpen ? 
        <NewDeviceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false) } 
          setAddStatus={setAddStatus} 
          devices={devices}
          setDevices={setDevices} 
          mqttTopics={mqttTopics}
        /> : ''} 
    </div>
  );
}

export default DeviceToolbar;
