import React from "react";
import styles from './styles/sidebar.module.css'; 

const Sidebar = ({ addWidget, isCollapsed, onToggle }) => {
  
  return (
    <div className={isCollapsed ? styles.collapsed : styles.sidebar}>
     
      <a href="#toggle" className={styles.link} onClick={onToggle}>
        {isCollapsed ? '🡆' : '🡄'}
      </a>

      <a href="#home" className={styles.link} onClick={() => addWidget('LineChart')}>
        <span className={styles.icon}>🏠</span>
        <span className={isCollapsed ? styles.hidden : styles.visible}>Line chart</span>
      </a>

      <a href="#news" className={styles.link}>
        <span className={styles.icon}>📰</span>
        <span className={isCollapsed ? styles.hidden : styles.visible}>Bar graph</span>
      </a>

      <a href="#contact" className={styles.link}>
        <span className={styles.icon}>📞</span>
        <span className={isCollapsed ? styles.hidden : styles.visible}>Pie chart</span>
      </a>

      <a href="#about" className={styles.link}>
        <span className={styles.icon}>ℹ️</span>
        <span className={isCollapsed ? styles.hidden : styles.visible}>About</span>
      </a>

    </div>

  );
};

export default Sidebar;
