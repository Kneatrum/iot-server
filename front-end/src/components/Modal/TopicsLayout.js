import { useState, useEffect } from 'react';
import axios from 'axios';
import TextInput from './TextInput';
const { v4: uuidv4 } = require('uuid');


const TopicsLayout = (userTopics) => {
    let topics = userTopics.userTopics
    // const [ topics, setTopics ] = useState();
    const [ inputValue, setInputValue ] = useState(''); // Keep track of current input value
    const [ inputComponents, setInputComponents ] = useState([]);
    const [ addInput, setAddInput ] = useState(true);
    const [ isLoading, setIsloading ] = useState(false);
    

    useEffect(() => {
        const hasFailed = inputComponents.some(item => item.failed === true);
        setAddInput(!hasFailed && !isLoading);
    }, [inputComponents, isLoading])


    useEffect(() => {
        topics.forEach((entry) => {
            addNewInput({topic: entry.topic});
        });
    }, []);


    const handleKeyDown = (event, inputValue) => {
        setIsloading(true);
        if (event.key === 'Enter') {
            addNewInput({
                topic:inputValue, 
                readOnlyMode:false, 
                showButtonsState: true,
                loading:true, 
                failed:false, 
                saved:false
            });
           
        } 
    };

   
    const handleDeleteInput = (id) => {
        setInputComponents((prevInputs) =>
            prevInputs.filter(inputComponent => inputComponent.uniqueId !== id)
        );
    };


    const handleInputChange = (value) => {
        setInputValue(value); // Update the current input value
    };
    

    const addNewInput = ({topic = '', readOnlyMode=true, showButtonsState=true, loading=false, failed=false, saved=true } = {}) => {
        const uniqueId = uuidv4();
        setInputComponents((prevInputs) => [
            ...prevInputs,
            { uniqueId, topic, readOnlyMode, showButtonsState, loading, failed, saved }
        ]);
    };


    const updateInputComponent = (topic, updatedProperties) => {
        console.log("Starting update for topic:", topic);
        console.log("Current inputComponents:", inputComponents);
        console.log("Updates to apply:", updatedProperties);
        
        setInputComponents(prevInputs => {
            const newInputs = prevInputs.map(component => {
                if (component.topic === topic) {
                    const updatedComponent = { ...component, ...updatedProperties };
                    console.log("Found matching component - Before:", component);
                    console.log("After update:", updatedComponent);
                    setIsloading(false);
                    return updatedComponent;
                }
                return component;
            });
            
            console.log("New inputComponents state:", newInputs);
            return newInputs;
        });
    };

   

    return (
        <>
            {inputComponents.map((component) => (
                <TextInput
                    key={component.uniqueId}
                    handleKeyDown={handleKeyDown}
                    updateInputComponent={updateInputComponent}
                    topic={component.topic}
                    loading={component.loading}
                    failed={component.failed}
                    saved={component.saved}
                    readOnlyMode={component.readOnlyMode} 
                    showButtonsState={component.showButtonsState}  
                    onDelete={() => handleDeleteInput(component.uniqueId)}
                    onInputChange={handleInputChange}
                />
            ))}
            

            { addInput && <TextInput
                handleKeyDown={handleKeyDown}
                readOnlyMode={false} 
                showButtonsState={false}  
                loading={false}
                failed={false}
                saved={false}
                // onDelete={() => handleDeleteInput("")}
                onInputChange={setInputValue}
                updateInputComponent={updateInputComponent}  // Added this
                value={inputValue} // Controlled by inputValue state
            />
            }

        </>
    );
}

export default TopicsLayout;



