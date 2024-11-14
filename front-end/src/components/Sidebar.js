import React, { useState } from "react";
import styles from './styles/sidebar.module.css'; 
import chartTypes  from "./ChartTypes";
import {ReactComponent as PanelClose}  from '../assets/panel-close.svg';
import {ReactComponent as PanelOpen} from '../assets/panel-open.svg';
import { ReactComponent as AddMqtt } from '../assets/mqtt-topics.svg'

const Sidebar = ({ showModal, saveLayout, addWidget, isCollapsed, onToggle }) => {

  
  return (
    <div className={isCollapsed ? styles.collapsed : styles.sidebar}>
     
      <div className={styles.panelIconContainer} onClick={onToggle}>
        {
          isCollapsed ?(
            <PanelOpen className={styles.panelIcon}/>
          ) : (
            <PanelClose className={styles.panelIcon}/>
          )
        }
      </div>

      {/* <div className={ isCollapsed ? styles.topicIconContainerSmall : styles.topicIconContainerBig } onClick={() => showModal()}>
        <span className={styles.topicIcon}> <AddMqtt/> </span>
        <span className={isCollapsed ? styles.topicIconTextHide : styles.topicIconTextShow}>Add Data Sources</span>
      </div> */}

      <div className={ isCollapsed ? styles.linkContainer : styles.linkContainerBig}>
        {
          Object.entries(chartTypes).map(([key, element]) => (
            <div className={styles.link} onClick={() => addWidget(key, element.minWidth, element.minHeight)} key={key}>
              <span className={styles.icon}>{element.icon}</span>
              <span className={isCollapsed ? styles.hidden : styles.visible}>{element.type}</span>
            </div>
          ))
        }
      </div>
  
      {/*saveLayout()*/}
  
    </div>
  );
};

export default Sidebar;
