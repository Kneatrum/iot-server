import React, { useState, useEffect } from 'react';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as ErrorIcon } from '../../assets/error.svg';
import styles from '../styles/modal.module.css';
import Spinner from '../Spinner.js';
import api from '../../api/api.js';
import axios from 'axios';



const TextInput = ({ 
        handleKeyDown, 
        updateInputComponent,
        topic = '', 
        readOnlyMode, 
        showButtonsState, 
        loading,
        failed, 
        saved, 
        onInputChange, 
        onDelete 
    }) => {

    const [ isReadOnly, setReadOnly ] = useState(readOnlyMode);
    const [ showButtons, setShowButtons ] = useState(showButtonsState);
    const [ isLoading, setLoading ] = useState(loading);
    const [ isSaved, setSavedStatus ] = useState(saved);
    const [ inputValue, setInputValue ] = useState(topic);
    const [ hasFailed, setFailedStatus ] = useState(failed);
    const [ isEditMode, setEditMode ] = useState(false);
    const [ isDeleteLoading, setDeleteLoading ] = useState(false);
    const [ apiTriggered, setApiTriggered ] = useState(false);


     
     useEffect(() => {
        setLoading(loading);
        setSavedStatus(saved);
        setFailedStatus(failed);
        setReadOnly(readOnlyMode);
    }, [loading, saved, failed, readOnlyMode]);


    const localHandleKeyDown = (event) => {
        if (event.key === 'Enter' && inputValue.trim()) {
            if ( handleKeyDown ) {
                if(!isEditMode)handleKeyDown(event, inputValue); // Call the parent handler if passed
                setApiTriggered(true);
                console.log("Api triggered")
            }
        }
    }


    // Trigger API call on state change using useEffect
    useEffect(() => {
        if (apiTriggered) {
            axios.get('https://671165104eca2acdb5f4b7e2.mockapi.io/api/test/topics')
                .then((response) => {
                    setLoading(false);
                    setFailedStatus(false);
                    setSavedStatus(true);
                    
                   
                    if (updateInputComponent) {
                        console.log("Calling updateInputComponent with:", {
                            topic: inputValue,
                            updates: {
                                loading: false,
                                readOnlyMode: true,
                                saved: true,
                                failed: false,
                            }
                        });
                        
                        updateInputComponent(inputValue, {
                            loading: false,
                            readOnlyMode: true,
                            saved: true,
                            failed: false,
                        });
                        
                        setReadOnly(true);
                        setEditMode(false);
                    } 
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setLoading(false);
                    setFailedStatus(true);
                    setReadOnly(false);
                    setSavedStatus(false);
                    
                    if (updateInputComponent) {
                        updateInputComponent(inputValue, {
                            loading: false,
                            readOnlyMode: false,
                            saved: false,
                            failed: true,
                        });
                    }
                })
                .finally(() => setApiTriggered(false));
        }
    }, [apiTriggered, inputValue, updateInputComponent]); // Added missing dependencies


    const handleInputChange = (event) => {
        // const value = event.target.value;
        // setInputValue(value); // Update local state
        // if (onInputChange) {
        //     onInputChange(value); // Optionally pass the value back to the parent
        // }
        const value = event.target.value;
        setInputValue(value);
        onInputChange(value);
    };


    const handleEditButtonClick = (event) => {
        const clickedElement = event.target;

        // Check if the EditIcon was clicked
        if (clickedElement.closest(`.${styles.mqttEditIcon}`)) {
            setSavedStatus(false);
            setReadOnly(false);
            setEditMode(true);
        }

        // Check if the Spinner was clicked
        else if (clickedElement.closest(`.${styles.spinnerIcon}`)) {
            console.log('Spinner clicked');
            // Handle spinner click (if necessary)
        }
        // Check if the ErrorIcon was clicked
        else if (clickedElement.closest(`.${styles.errorIcon}`)) {
            console.log('Error icon clicked');
            // Handle error icon click
        }
    }


    const handleDeleteButtonClick = () => {
        
        // setDeleteLoading(true);

        // api.post('url', inputValue)
        // .then(response => {
            
        //     console.log(response.data);
        //     setDeleteLoading(false);
            
        // })
        // .catch(error => {
        //     console.log("Failed to delete")
        //     console.error('Error fetching data:', error.message);
        // });

        setTimeout(() => {
            setDeleteLoading(true);
            if (onDelete) {
                onDelete(); // Notify parent to delete the topic
            }
        }, 1000);

    }

    
    return (
        <div className={styles.mqttEntryRow}>
            <input 
                className={`${styles.mqttInput} ${isReadOnly ? styles.mqttInputReadOnly : ''}`} 
                type="text" 
                readOnly={isReadOnly}
                autoComplete="off" 
                id="mqtt-topics" 
                name="mqtt-topics" 
                onKeyDown={localHandleKeyDown} 
                onChange={handleInputChange}
                placeholder="Add topic and press Enter"
                value={inputValue || ''}> 
            </input>
            <div className={`${showButtons && !isEditMode ? styles.mqttIconContainer : styles.mqttIconContainerHide}`} onClick={handleEditButtonClick}> 
                { isSaved ? (<EditIcon className={styles.mqttEditIcon} />) : ('')}
                { isLoading && !hasFailed ? (<Spinner size={20} />) : ('')}
                { hasFailed ? (<ErrorIcon className={styles.errorIcon} />) : ('') }
            </div>
            <div className={`${showButtons && isSaved ? styles.mqttIconContainer : styles.mqttIconContainerHide }`} onClick={handleDeleteButtonClick}> 
                { isSaved ? (<DeleteIcon className={styles.mqttDeleteIcon} />) : ('') }
                { isDeleteLoading ? (<Spinner size={20} />) : ('')}
            </div>
        </div>
    );
}

export default TextInput;
