import { useState, useEffect } from 'react';
import TextInput from './TextInput';
const { v4: uuidv4 } = require('uuid');


const TopicsLayout = ({existingTopics, handleAddTopic}) => {
    
    const [ inputComponents, setInputComponents ] = useState([]);
    const [ addInput, setAddInput ] = useState(true);
    const [ isLoading, setIsloading ] = useState(false);
    const [ topics, setTopics ] = useState(existingTopics)

    useEffect(() => {
        const hasFailed = inputComponents.some(item => item.failed === true);
        setAddInput(!hasFailed && !isLoading);
    }, [inputComponents, isLoading])


    useEffect(() => {
        if(topics && topics.length > 0){
            topics.forEach((topic) => {
                addNewInput({
                    description: topic.description, 
                    topic: topic.topic
                });
            });
        }
    }, [topics]);

   
    const handleDeleteInput = (id) => {
        setInputComponents((prevInputs) =>
            prevInputs.filter(inputComponent => inputComponent.uniqueId !== id)
        );
    };
    

    const addNewInput = ({
        description = '',
        topic = '', 
        readOnlyMode=true, 
        showButtonsState=true, 
        loading=false, 
        failed=false, 
        saved=true 
    } = {}) => {
        const uniqueId = uuidv4();
        setInputComponents((prevInputs) => [
            ...prevInputs,
            { uniqueId, description, topic, readOnlyMode, showButtonsState, loading, failed, saved }
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
        <div>

            {inputComponents.map((component) => (
                <TextInput
                    key={component.uniqueId}
                    handleAddTopic={handleAddTopic}
                    addNewInput={addNewInput}
                    updateInputComponent={updateInputComponent}
                    topicDescription={component.description}
                    topic={component.topic}
                    readOnlyMode={component.readOnlyMode} 
                    showButtonsState={component.showButtonsState}  
                    loading={component.loading}
                    failed={component.failed}
                    saved={component.saved}
                    onDelete={() => handleDeleteInput(component.uniqueId)}
                />
            ))}
            

            { addInput && 
                <TextInput
                    addNewInput={addNewInput}
                    handleAddTopic={handleAddTopic}
                    updateInputComponent={updateInputComponent}
                    readOnlyMode={false} 
                    showButtonsState={false}  
                    loading={false}
                    failed={false}
                    saved={false}
                    // onDelete={() => handleDeleteInput("")}
                />
            }

        </div>
    );
}

export default TopicsLayout;



