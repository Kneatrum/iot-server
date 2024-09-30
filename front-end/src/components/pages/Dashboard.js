import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import styles from '../styles/dashboard.module.css';


const Dashboard = () => {

  const [layout, setLayout] = useState([{ i: 'widget1', x: 0, y: 0, w: 2, h: 4 },]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 60 : 250; // Width of the sidebar
  const gridWidth = `calc(100% - ${sidebarWidth}px)`; // Available width for the grid

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const addWidget = () => {
    const newWidget = { i: `widget${layout.length + 1}`, x: 0, y: Infinity, w: 2, h: 4 };
    setLayout([...layout, newWidget]);
  };


  return (
    <>
      <Header/>
      <Sidebar addWidget={addWidget} isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div className={styles.dashboard} style={{ marginTop: '89px', marginLeft: `${sidebarWidth}px`,  width: gridWidth}}>
        <GridLayout
          className="complex-interface-layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1800}
          onLayoutChange={(newLayout) => setLayout(newLayout)}
        >
          {layout.map((item) => (
            <div key={item.i} style={{ background: '#009688' }}>
              {`Widget ${item.i}`}
            </div>
          ))}
      
        </GridLayout>
      </div>
    </>
  );
};

export default Dashboard;