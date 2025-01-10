// NewDevice.js
import React, { act, useEffect, useState } from 'react';
import styles from '../components/styles/newdevice.module.css';
import { ReactComponent as CancelIcon } from '../assets/cancel.svg';
import { ReactComponent as SmallTick } from '../assets/smalltick.svg';
import { ReactComponent as ErrorIcon } from '../assets/error.svg' 
import { ReactComponent as SuccessIcon } from '../assets/success.svg' 
import { ReactComponent as DownloadIcon } from '../assets/download.svg' 
import { useDispatch } from "react-redux";
import { addDevice } from './devicesSlice';
import { DEVICE_TEMPLATE } from './pages/Dashboard';

import Topics from './Topics';
import TopicsLayout from './Modal/TopicsLayout';


import Spinner from '../components/Spinner';
import { api, certsApi } from '../api/api';
import { set } from 'date-fns';

const tabs = ["MQTT", "CoAP", "AMQP", "WebSockets"];
const CERTIFICATE = "certificate.crt";
const CLIENT_KEY = "clientKey.key";
const ROOT_CA = "rootCA.crt";


function NewDeviceModal({ isOpen, onClose, setAddStatus, mqttTopics,  setActiveDevice, setDeviceCount }) {
    const [stage, setStage] = useState(1);
    const [deviceName, setDeviceName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [apiKey, setApiKey] = useState('');
    // const [selectedTopics, setSelectedTopics] = useState([]);
    // const [keyCopied, setApiKeyCopied] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ failed, setFailed ] = useState(false);
    const [ success, setSuccess ] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [ topics, setTopics ] = useState([]);
    const dispatch = useDispatch();


    const handleAddTopic = (newTopic) => {
        setTopics((prevTopics) => [
            ...prevTopics,
            newTopic
        ]);
    };


    useEffect(() => {
        console.log("Passed all the way up fron input text", topics)
    }, [topics])

    
    async function fetchCertificates(){
        certsApi.post('/generate-certs', {serialNumber: serialNumber})
        .then(response => {
            const { clientCert, clientKey, rootCA } =  response.data;
            
            createDownload(CERTIFICATE, atob(clientCert));
            createDownload(CLIENT_KEY, atob(clientKey));
            createDownload(ROOT_CA, atob(rootCA));

            setLoading(false);
            // console.log(response.data);
            // setAddStatus(true); // update status if needed
            setSuccess(true);
            // setDevices([...devices, deviceName]);
            // onClose();
            
        })
        .catch(error => {
            console.log("Failed to delete")
            console.error('Error fetching data:', error.message);
            setLoading(false);
            setFailed(true);
        });
    }

    function createDownload(fileName, content) {
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      }

    const handleNext = () => {
        // Validation check for required fields before moving to stage 3
        if (stage === 1 && (!deviceName || !serialNumber)) {
            alert('Please enter both Device Name and Serial Number.');
            return;
        } else if (stage === 2 && topics.length === 0) {
            alert('Please select at least one MQTT topic.');
            return;
        }

        // Generate API key at stage 2
        if (stage === 2) {
            handleSubmit();
            // setApiKey(generateApiKey());
        }

        setStage(stage + 1);
    };

    const handleBack = () => setStage(stage - 1);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        alert("API key copied to clipboard!");
        // setApiKeyCopied(true);
    };

    const handleSubmit = () => {
        if (!deviceName || !serialNumber || topics.length === 0) {
            alert('Please ensure all fields are filled and at least one MQTT topic is selected.');
            return;
        }

        // const newDevice = {
        //     deviceName: deviceName,
        //     serialNumber: serialNumber, // New serial number 
        //     topics: topics,
        //     activeStatus: true,
        // };
        
        DEVICE_TEMPLATE.deviceName = deviceName;
        DEVICE_TEMPLATE.serialNumber = serialNumber;
        DEVICE_TEMPLATE.activeStatus = true;
        

        setActiveDevice((prevDevice) => ({ 
            ...prevDevice,
            index: prevDevice.index + 1,
            deviceName: deviceName,
            serialNumber: serialNumber,
            activeStatus: DEVICE_TEMPLATE.activeStatus
        }));
 
        console.log("All Data",  DEVICE_TEMPLATE)
        setFailed(false);
        setLoading(true);
        setSuccess(false)

        api.post('/add-device', { newDevice: DEVICE_TEMPLATE, topics: topics })
        .then((response) => {
            console.log(response.data);
            setAddStatus(true); // Update status if needed
            setSuccess(true);
            dispatch(addDevice(DEVICE_TEMPLATE));

            setDeviceCount((prevCount) => ({
                    prevCount: prevCount + 1
                    // dispatch(setActiveDeviceIndex({prevIndex: prevIndex, activeIndex: index}));
                })
            );
            // setDevices([...devices, { name: deviceName, serial: serialNumber }]);
        })
        .catch((error) => {
            console.error('Error occurred:', error.message);
            setFailed(true);
        })
        .finally(() => {
            setLoading(false);
        });
    
    };

    const onStageOneNext = () => {
        api
            .get('/check-serial-number', {
                params: { serialNumber : serialNumber }, 
            })
            .then(response => {
                const { exists, message } = response.data; 
    
                if (exists) {
                    console.log('Serial number exists:', message);
                    alert('A device with the same serial number exists !');
                    return;
                } else {
                    setStage(stage + 1);
                }
            })
            .catch(error => {
                console.error('Error checking serial number:', error.message);
                alert('Failed to check the serial number. Please try again later.');
            });
    };

    

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.formHeader}>
                    <h6>Device Registration</h6>
                    <CancelIcon className={styles.closeIcon} onClick={onClose} />
                </div>

                
                <div className={styles.progressIndicator}>
                    <div className={stage >= 1 ? styles.currentStep : styles.step}>{stage > 1 ? <SmallTick /> : ''}</div>
                    <div className={stage > 1 ? styles.greenProgressLine : styles.grayProgressLine}></div>
                    <div className={stage >= 2 ? styles.currentStep : styles.step}>{stage > 2 ? <SmallTick /> : ''}</div>
                    <div className={stage > 2 ? styles.greenProgressLine : styles.grayProgressLine}></div>
                    <div className={stage === 3 ? styles.currentStep : styles.step}>{stage === 3 && success ? <SmallTick /> : ''}</div>
                </div>

                {/* Stage Content */}
                {stage === 1 && (
                    <div className={styles.formContainer}>
                        <div className={styles.stageBody}>
                            <div className={styles.inputTitle}>
                                Device Name:
                            </div>
                            <input
                                type="text"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                className={styles.input}
                                required
                            />
                            
                            <div className={styles.inputTitle}>
                                Serial Number:
                            </div>
                            <input
                                type="text"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                className={styles.input}
                                required
                            />
                            
                        </div>
                        <div className={styles.singleButtonContainer}>
                            <button onClick={onStageOneNext} className={styles.nextButton}>Next</button>
                        </div>
                    </div>
                )}

                {stage === 2 && (
                    <div className={styles.formContainer}>
                        <div className={styles.stageBody}>
                            <div className={styles.tabContainer}>
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
                            <div className={styles.topicList}>
                                {/* {tabContent[activeTab]} */}
                                { activeTab === 0 ? <TopicsLayout existingTopics={topics} handleAddTopic={handleAddTopic}/> : ''}
                            </div>
                        </div>
                        <div className={styles.buttonContainer}>
                            <button onClick={handleBack} className={styles.backButton}>Back</button>
                            <button onClick={handleNext} className={styles.nextButton}>Next</button>
                        </div>
                    </div>
                )}

                {stage === 3 && (
                    <div className={styles.formContainer}>
                        <div className={styles.stageBody}>
                            
                            { loading ? <div> Loading </div> : ''}
                            { success ? <div> Please download your certificates </div> : ''}
                            { failed ? <div> Failed </div> : ''}

                            <div className={styles.spinnerContaier}>
                                { loading ? <Spinner size={50} /> : '' }
                                
                                { success ? (
                                    <>
                                        <div className={styles.apiKeyBox}>
                                            <span style={{display: 'flex', justifyContent: 'left'}} >{CERTIFICATE}</span>
                                            <span style={{display: 'flex', justifyContent: 'left'}} >{CLIENT_KEY}</span>
                                            <span  style={{display: 'flex', justifyContent: 'left'}} >{ROOT_CA}</span>
                                            <div className={styles.downloadIconContainer}
                                                onClick={fetchCertificates}>
                                                <DownloadIcon  className={styles.downloadIcon}/>
                                            </div>
                                        </div> 
                                    </>
                                ) : ''}

                                { failed ? <ErrorIcon className={styles.errorIcon} /> : '' }
                            </div>
                            
                            
                        </div>
                        <div className={styles.buttonContainer}>
                            {
                                !success ? (
                                    <>
                                        <button onClick={handleBack} className={styles.backButton}>Back</button>
                                        <button onClick={handleSubmit} className={`${styles.retryButton} ${styles.selected}`}>Retry</button>
                                    </>
                                ) : 
                                ('')
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewDeviceModal;
