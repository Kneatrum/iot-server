import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/toolbar.module.css';
import { ReactComponent as AddSVGIcon } from '../../assets/add.svg';
import { ReactComponent as MoreSVGIcon } from '../../assets/more.svg';
import OptionsModal from '../OptionsModal';
import NewDeviceModal from '../NewDeviceModal';
import { useDispatch } from "react-redux";
import { removeDevice, setActiveDeviceIndex } from '../devicesSlice';


const deviceOptions = ['Settings', 'Delete', 'Edit'];
const defaultActiveTab = 0;

function DeviceToolbar({ isCollapsed, mqttTopics, devices, setActiveDevice, setDeviceCount }) {
  const [addStatus, setAddStatus] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState(null); // Track which button is active
  const [ activeTab, setActiveTab ] = useState(defaultActiveTab);
  const dispatch = useDispatch();

  // Create an array of refs for all devices
  const buttonRefs = useRef([]);


  const addDevice = () => {
    setIsModalOpen(true);
  };

/** 
 * Removes an object from the list by its serial number.
 * @param {Array} list - The array of device objects.
 * @param {string} serialNumber - The serial number to search for.
 * @returns {Array} The updated list with the object removed and .
 */

function removeBySerial(list, serialNumber) {
  const index = list.findIndex(device => device.serial === serialNumber);
  if (index !== -1) {
    list.splice(index, 1); // Remove the object at the found index 
    const lengthOfArray = list.length;
    if(index === lengthOfArray){
      list[index-1].active = true
    } else if(lengthOfArray > 1){
      list[index].active = true
    }
  } else {
    console.log(`Serial number "${serialNumber}" not found.`);
  }
  return {updatedList :list, deletedIndex: index};
}

  const actions = (action, devices, serialNumber) => {
    if(action === 'Delete'){
      console.log("Devices: ", devices)
      const result = removeBySerial(devices, serialNumber)

      console.log("Updated List: ", result.updatedList);
      setActiveTab(result.deletedIndex - 1)
      
      dispatch(removeDevice(serialNumber));
      // setDevices(result.updatedList);
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
        <div className={` ${styles.toolbarItem} ${styles.toolbarItemDescription} `}>Devices</div>
      </div>

      <div className={styles.toolbarHeader}>
        {devices.map((device, index) => {
          // Ensure refs array has enough refs for the devices
          if (!buttonRefs.current[index]) {
            buttonRefs.current[index] = React.createRef();
          }

          return (
            <div
              key={index}

              className={`${styles.toolbarItem} ${activeTab === index ? styles.toolbarItemActive : ''} `}

              onClick={() => {
                console.log("Act Tab:",index)
                setActiveTab(index);
                // setActiveTab((prevIndex) => {
                //   // dispatch(setActiveDeviceIndex({prevIndex: prevIndex, activeIndex: index}));
                //   return index;
                // });

                setActiveDevice((prevDevice) => ({
                  ...prevDevice,
                  index: index,
                  deviceName: device.name,
                  serialNumber: device.serial
                }));

                console.log("Active Tab: ", activeTab)
                console.log("Devices: ", devices)
                // console.log("Updated devices: ", updatedDevices)
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
                    devices={devices}
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
          mqttTopics={mqttTopics}
          setActiveDevice={setActiveDevice}
          setDeviceCount={setDeviceCount}
        />
      ) : (
        ''
      )}
    </div>
  );
}

export default DeviceToolbar;
