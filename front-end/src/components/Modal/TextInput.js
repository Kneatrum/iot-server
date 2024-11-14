import React, { useState, useEffect } from 'react';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as ErrorIcon } from '../../assets/error.svg';
import styles from '../styles/modal.module.css';
import Spinner from '../Spinner.js';
import api from '../../api/api.js';



const TextInput = ({ 
        addNewInput,
        updateInputComponent,
        topicDescription = '',
        topic = '', 
        readOnlyMode, 
        showButtonsState, 
        loading,
        failed, 
        saved,  
        onDelete,
        handleAddTopic
    }) => {

    const [ isReadOnly, setReadOnly ] = useState(readOnlyMode);
    const [ showButtons, setShowButtons ] = useState(showButtonsState);
    const [ isLoading, setLoading ] = useState(loading);
    const [ isSaved, setSavedStatus ] = useState(saved);
    const [ topicDescriptionString,  settopicDescriptionString ] = useState(topicDescription)
    const [ topicString, setTopicString ] = useState(topic);
    const [ hasFailed, setFailedStatus ] = useState(failed);
    const [ isEditMode, setEditMode ] = useState(false);
    const [ isDeleteLoading, setDeleteLoading ] = useState(false);
    const [ apiTriggered, setApiTriggered ] = useState(false);
    const [ deleteTriggered, setDeleteTriggered ] = useState(false);


     
     useEffect(() => {
        setLoading(loading);
        setSavedStatus(saved);
        setFailedStatus(failed);
        setReadOnly(readOnlyMode);
    }, [loading, saved, failed, readOnlyMode]);




    // Trigger API call on state change using useEffect
    useEffect(() => {
        if (apiTriggered) {
            api.post('/topic', {description: topicDescriptionString, topic: topicString})
                .then((response) => {
                    setLoading(false);
                    setFailedStatus(false);
                    setSavedStatus(true);

                   
            
                    console.log("Topic name: ", topicDescriptionString);
                    console.log("Topic String: ", topicString);
                    
                   
                    if (updateInputComponent) {
                        console.log("Calling updateInputComponent with:", {
                            topic: topicString,
                            updates: {
                                loading: false,
                                readOnlyMode: true,
                                saved: true,
                                failed: false,
                            }
                        });
                        
                        updateInputComponent(topicString, {
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
                        updateInputComponent(topicString, {
                            loading: false,
                            readOnlyMode: false,
                            saved: false,
                            failed: true,
                        });
                    }
                })
                .finally(() => setApiTriggered(false));
        }
    }, [apiTriggered, topicString, updateInputComponent]); 

    // Trigger API call on state change using useEffect
    useEffect(() => {
        if (deleteTriggered) {
            api.delete('/topic', { data: {topic: topicString }})
            .then(response => {
                console.log(response.data);
                setDeleteLoading(false);
                if (onDelete) {
                    onDelete(); // Notify parent to delete the topic
                }
            })
            .catch(error => {
                console.log("Failed to delete");
                console.error('Error fetching data:', error.message);
            })
            .finally(() => setDeleteTriggered(false));
        }
    }, [deleteTriggered, topicString, updateInputComponent]); 

    const handleTopicDescriptionInputChange = (event) => {
        // const value = event.target.value;
        // setTopicString(value); // Update local state
        // if (onTopicInputChange) {
        //     onTopicInputChange(value); // Optionally pass the value back to the parent
        // }
        const value = event.target.value;
        // onTopicDescriptionInputChange(value);
        settopicDescriptionString(value);
    };


    const handleTopicStringInputChange = (event) => {
        // const value = event.target.value;
        // setTopicString(value); // Update local state
        // if (onNameInputChange) {
        //     onNameInputChange(value); // Optionally pass the value back to the parent
        // }
        const value = event.target.value;
        setTopicString(value);
        // onTopicStringInputChange(value);
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
        setDeleteTriggered(true);
        setDeleteLoading(true);
    }

    const handleSaveButtonClick = () => {
        if(!topicDescriptionString || !topicString){
            console.log("Mchezo utawacha")
            return;
        }

        addNewInput({
            description: topicDescriptionString,
            topic: topicString, 
            readOnlyMode: true, 
            showButtonsState: true,
            loading: false, 
            failed: false, 
            saved: true
        });

        handleAddTopic({
            description: topicDescriptionString, 
            topic: topicString
        })


        settopicDescriptionString('');
        setTopicString('');

    }

    
    return (
        <div className={styles.mqttEntryRow}>
            <div style={{display: 'flex', backgroundColor: 'white', borderRadius: '10px', padding: '10px', width: '500px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <input 
                        className={`${styles.mqttInput} ${isReadOnly ? styles.mqttInputReadOnly : ''}`}
                        type="text" 
                        readOnly={isReadOnly}
                        autoComplete="off" 
                        id='topic-name'
                        name='topic-name'
                        onChange={handleTopicDescriptionInputChange}
                        placeholder="Description"
                        value={topicDescriptionString || ''}>
                    </input>
                    <input 
                        className={`${styles.mqttInput} ${isReadOnly ? styles.mqttInputReadOnly : ''}`} 
                        type="text" 
                        readOnly={isReadOnly}
                        autoComplete="off" 
                        id="mqtt-topics" 
                        name="mqtt-topics" 
                        onChange={handleTopicStringInputChange}
                        placeholder="Add topic"
                        value={topicString || ''}> 
                    </input>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex'}}>
                        <div className={`${true && !isEditMode ? styles.mqttIconContainer : styles.mqttIconContainerHide}`} onClick={handleEditButtonClick}> 
                            { isSaved ? (<EditIcon className={styles.mqttEditIcon} />) : ('')}
                            { isLoading && !hasFailed ? (<Spinner size={20} />) : ('')}
                            { hasFailed ? (<ErrorIcon className={styles.errorIcon} />) : ('') }
                        </div>
                        <div className={`${true && isSaved ? styles.mqttIconContainer : styles.mqttIconContainerHide }`} onClick={handleDeleteButtonClick}> 
                            { isSaved && !isDeleteLoading ? (<DeleteIcon className={styles.mqttDeleteIcon} />) : ('') }
                            { isDeleteLoading ? (<Spinner size={20} />) : ('')}
                        </div>
                    </div>
                    { !isSaved ? <button className={styles.saveButton} onClick={handleSaveButtonClick}>Save</button> : ''}
                </div>
            </div>
        </div>
    );
}

export default TextInput;
