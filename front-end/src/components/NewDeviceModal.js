// NewDevice.js
import React, { useState } from 'react';
import styles from '../components/styles/newdevice.module.css';
import { ReactComponent as CancelIcon } from '../assets/cancel.svg';
import { ReactComponent as SmallTick } from '../assets/smalltick.svg';
import { ReactComponent as ErrorIcon } from '../assets/error.svg' 
import { ReactComponent as SuccessIcon } from '../assets/success.svg' 
import { ReactComponent as CopyIcon } from '../assets/copy.svg' 
import TopicBadge from './TopicBadge';


import Spinner from '../components/Spinner';
import api from '../api/api';
import axios from 'axios';

const tabs = ["MQTT", "CoAP", "AMQP", "WebSockets"];


function NewDeviceModal({ isOpen, onClose, setAddStatus, mqttTopics, devices, setDevices}) {
    const [stage, setStage] = useState(1);
    const [deviceName, setDeviceName] = useState('');
    const [uniqueId, setUniqueId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [keyCopied, setApiKeyCopied] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ failed, setFailed ] = useState(false);
    const [ success, setSuccess ] = useState(false);
    const [activeTab, setActiveTab] = useState(0);


    const handleTopicSelection = (topic) => {
        setSelectedTopics(prev =>
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };


    const tabContent = [
        <TopicBadge 
            topics={mqttTopics}
            selectedTopics={selectedTopics}
            onToggleTopic={handleTopicSelection}
        />,
        "",
        "",
        "",
    ];
    
    const generateApiKey = () => `${Math.random().toString(36).substring(2, 15)}`;

    const handleNext = () => {
        // Validation check for required fields before moving to stage 3
        if (stage === 1 && (!deviceName || !uniqueId)) {
            alert('Please enter both Device Name and Serial Number.');
            return;
        } else if (stage === 2 && selectedTopics.length === 0) {
            alert('Please select at least one MQTT topic.');
            return;
        }

        // Generate API key at stage 2
        if (stage === 2) {
            handleSubmit();
            setApiKey(generateApiKey());
        }

        setStage(stage + 1);
    };

    const handleBack = () => setStage(stage - 1);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        alert("API key copied to clipboard!");
        setApiKeyCopied(true);
    };

    const handleSubmit = () => {
        if (!deviceName || !uniqueId || selectedTopics.length === 0) {
            alert('Please ensure all fields are filled and at least one MQTT topic is selected.');
            return;
        }
        setFailed(false);
        setLoading(true);
        setSuccess(false)

        const newDeviceData = {
            deviceName,
            uniqueId,
            apiKey,
            selectedTopics,
        };


        // api.post('url', newDeviceData)
        // .then(response => {
        //     setLoading(false);
        //     console.log(response.data);
        //     setAddStatus(true); // update status if needed
        //     setSuccess(true);
        //     onClose();
            
        // })
        // .catch(error => {
        //     console.log("Failed to delete")
        //     console.error('Error fetching data:', error.message);
        //     setLoading(false);
        //     setFailed(true);
        // });

        axios.get('https://671165104eca2acdb5f4b7e2.mockapi.io/api/test/topics')
        .then(response => {
            setLoading(false);
            const rr = response.data;

            setSuccess(true);
            setDevices([...devices, newDeviceData.deviceName]);

            // onClose();
            
        })
        .catch(error => {
            console.error('Error fetching data:', error.message);
            setLoading(false);
            setFailed(true); 
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
                            <label>
                                Device Name:
                                <input
                                    type="text"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </label>
                            <label>
                                Serial Number:
                                <input
                                    type="text"
                                    value={uniqueId}
                                    onChange={(e) => setUniqueId(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </label>
                        </div>
                        <div className={styles.singleButtonContainer}>
                            <button onClick={handleNext} className={styles.nextButton}>Next</button>
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
                                {tabContent[activeTab]}
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
                            { success ? <div> Please copy your API Key </div> : ''}
                            { failed ? <div> Failed </div> : ''}

                            <div className={styles.spinnerContaier}>
                                { loading ? <Spinner size={50} /> : '' }
                                
                                { success ? (
                                    <>
                                        <div className={styles.apiKeyBox}>
                                            <span>{apiKey}</span>
                                            <CopyIcon onClick={copyToClipboard} className={styles.copyIcon}/>
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
