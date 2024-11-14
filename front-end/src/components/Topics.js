import React from 'react';
import TopicsLayout from './Modal/TopicsLayout';
// import TopicBadge from './TopicBadge';


const Topics = ({ mqttTopics, selectedTopics, onToggleTopic }) => {
  return (
    <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: '100%'  // or a specific height value
    }}> 
        <div> 
            <TopicsLayout mqttTopics={mqttTopics} /> 
        </div>
     
        {/* <div style={{
            width: '10px',
            backgroundColor: 'white',
            alignSelf: 'stretch'
        }}></div>  */}
             
        {/* <div> 
            <TopicBadge 
                deviceTopics={mqttTopics} 
                selectedTopics={selectedTopics} 
                onToggleTopic={onToggleTopic} 
            /> 
        </div> */}
    </div>
  );
};

export default Topics;