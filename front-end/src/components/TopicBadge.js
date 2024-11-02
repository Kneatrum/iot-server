import React, { useState, useEffect } from 'react';
import styles from './styles/topicbadge.module.css';

const TopicBadge = ({ topics, selectedTopics, onToggleTopic }) => {
    const [toggledTopics, setToggledTopics] = useState({});

    useEffect(() => {
        const initialToggledTopics = {};
        topics.forEach((item) => {
            initialToggledTopics[item.uID] = selectedTopics.includes(item.topic);
        });
        setToggledTopics(initialToggledTopics);
    }, [topics, selectedTopics]);

    const handleToggle = (uID, topic) => {
        setToggledTopics((prevState) => ({
            ...prevState,
            [uID]: !prevState[uID]
        }));
        onToggleTopic(topic); // Call the parent function to update selected topics
    };

    return (
        <div className={styles.topicBadgeContainer}>
            {topics.map((item) => (
                <div 
                    key={item.uID} 
                    className={`${styles.topicBadge} ${toggledTopics[item.uID] ? '' : styles.grayedOut}`}
                >
                    <span className={`${styles.topicText} ${toggledTopics[item.uID] ? '' : styles.grayedText}`}>
                        {item.topic}
                    </span>
                    <input 
                        type="checkbox"
                        className={styles.checkbox}
                        checked={toggledTopics[item.uID] || false}
                        onChange={() => handleToggle(item.uID, item.topic)}
                    />
                </div>
            ))}
        </div>
    );
};

export default TopicBadge;
