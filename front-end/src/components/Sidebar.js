import React from "react";
import styles from './styles/sidebar.module.css'; 
import chartTypes  from "./ChartTypes";
import {ReactComponent as PanelClose}  from '../assets/panel-close.svg';
import {ReactComponent as PanelOpen} from '../assets/panel-open.svg';

const Sidebar = ({ saveLayout, addWidget, isCollapsed, onToggle }) => {

  
  return (
    <div className={isCollapsed ? styles.collapsed : styles.sidebar}>
     
      <span onClick={onToggle}>
        {
          isCollapsed ?(
            <PanelOpen className={styles.panelIcon}/>
          ) : (
            <PanelClose className={styles.panelIcon}/>
          )
        }
      </span>
  
      {
        Object.entries(chartTypes).map(([key, element]) => (
          <a href="#" className={styles.link} onClick={() => addWidget(key, element.minWidth, element.minHeight)} key={key}>
            <span className={styles.icon}>{element.icon}</span>
            <span className={isCollapsed ? styles.hidden : styles.visible}>{element.type}</span>
          </a>
        ))
      }
  
      {/*saveLayout()*/}
  
    </div>
  );
};

export default Sidebar;
