import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/toolbar.module.css';
import { ReactComponent as AddSVGIcon } from '../../assets/add.svg';
import { ReactComponent as MoreSVGIcon } from '../../assets/more.svg';
import OptionsModal from '../OptionsModal';
import NewDeviceModal from '../NewDeviceModal';
import { api } from '../../api/api';

const TOOLBAR_DESCRIPTION = [{ 
    "name": "Device", 
    "serial": "firstDevice001"
  }];

const deviceOptions = ['Settings', 'Delete', 'Edit'];

function DeviceToolbar({ isCollapsed, mqttTopics }) {
  const [devices, setDevices] = useState([TOOLBAR_DESCRIPTION]);
  const [activeTab, setActiveTab] = useState(1);
  const [addStatus, setAddStatus] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState(null); // Track which button is active

  // Create an array of refs for all devices
  const buttonRefs = useRef([]);

  useEffect(() => {
    if (devices.length === 1) {
      api
        .get('/names-and-serials')
        .then((response) => {

          const fetchedDevices = response.data.map((device) => ({
            name: device.name,
            serial: device.serial,
          }));
  
          // Append the fetched devices to the default TOOLBAR_DESCRIPTION
          setDevices([TOOLBAR_DESCRIPTION[0], ...fetchedDevices]);
  
          console.log("Devices: ", [TOOLBAR_DESCRIPTION[0], ...fetchedDevices]);
        })
        .catch((error) => {
          console.error('Error fetching data:', error.message);
        });
    }
  }, [devices.length, devices]);

  const addDevice = () => {
    setIsModalOpen(true);
  };

  const actions = (action, serialNumber) => {
    if(action === 'Delete'){
      setDevices((prevDevices) => 
        prevDevices.filter((device) => device.serial !== serialNumber)
      );
    }
  };

  const showOptions = (index) => {
    console.log('Button clicked for device:', index);
    setActiveButtonIndex(index); // Set the active button's index
    setIsOptionsModalOpen(true);
  };

  return (
    <div
      className={`${styles.toolbarContainer} ${
        isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      }`}
    >
      <div className={styles.toolbarHeader}>
        {devices.map((device, index) => {
          // Ensure refs array has enough refs for the devices
          if (!buttonRefs.current[index]) {
            buttonRefs.current[index] = React.createRef();
          }

          return (
            <div
              key={index}
              className={`${styles.toolbarItem} ${
                activeTab === index ? styles.toolbarItemActive : ''
              } ${
                index === 0 ? styles.toolbarItemDescription : ''
              }`}
              onClick={() => {
                setActiveTab(index === 0 ? 1 : index);
              }}
            >
              <div>{device.name}</div>

              <div
                style={{
                  display: 'flex',
                  marginRight: 0,
                  marginLeft: '20px',
                  visibility: activeTab === index ? 'visible' : 'hidden',
                  opacity: activeTab === index ? 1 : 0,
                }}
              >
                <MoreSVGIcon
                  ref={buttonRefs.current[index]}
                  style={{ fill: 'grey' }}
                  onClick={() => showOptions(index)} // Pass the index of the clicked button
                />

                {isOptionsModalOpen && activeButtonIndex === index && (
                  <OptionsModal
                    deviceSerialNumber={devices[activeTab]?.serial}
                    tabRef={buttonRefs.current[index]}
                    onClose={() => setIsOptionsModalOpen(false)}
                    options={deviceOptions}
                    actions={actions}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {addStatus ? (
        <div className={styles.addDeviceButton}>
          <AddSVGIcon className={styles.addSVGIcon} onClick={addDevice} />
        </div>
      ) : (
        ''
      )}
      {isModalOpen ? (
        <NewDeviceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          setAddStatus={setAddStatus}
          devices={devices}
          setDevices={setDevices}
          mqttTopics={mqttTopics}
        />
      ) : (
        ''
      )}
    </div>
  );
}

export default DeviceToolbar;
