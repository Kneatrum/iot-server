import React, { useState, useEffect } from 'react';
import styles from './styles/topicbadge.module.css';

const TopicBadge = ({ deviceTopics, selectedTopics, onToggleTopic }) => {
    const [toggledTopics, setToggledTopics] = useState({});

    useEffect(() => {
        if( deviceTopics && deviceTopics.length > 0){
            const initialToggledTopics = {};
            deviceTopics.forEach((item) => {
                initialToggledTopics[item.id] = selectedTopics.includes(item.topic);
            });
            setToggledTopics(initialToggledTopics);
        }
    }, [deviceTopics, selectedTopics]);

    const handleToggle = (id, topic) => {
        console.log("Toggle topic: ", topic);
        console.log("ID: ", id);
        setToggledTopics((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
        onToggleTopic(topic); // Call the parent function to update selected deviceTopics
    };

    return (
        <div>
            <div className={styles.topicBadgeContainer}>
                {deviceTopics.map((item) => (
                    <div 
                        key={item.id} 
                        className={`${styles.topicBadge} ${toggledTopics[item.id] ? '' : styles.grayedOut}`}
                    >
                        <span className={`${styles.topicText} ${toggledTopics[item.id] ? '' : styles.grayedText}`}>
                            {item.topic}
                        </span>
                        <input 
                            type="checkbox"
                            className={styles.checkbox}
                            checked={toggledTopics[item.id] || false}
                            onChange={() => handleToggle(item.id, item.topic)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicBadge;
