
// src/components/LandingPage.js

import styles from '../styles/features.module.css'
import React, { useState } from 'react';
import HamburgerMenu from '../HamburgerMenu';

const Features = () => {


const features = [
    {
    //   icon: <Wifi className="h-8 w-8 mb-4 text-blue-500" />,
      title: "Seamless Connectivity",
      description: "Connect and manage all your IoT devices in one intuitive platform"
    },
    {
    //   icon: <Shield className="h-8 w-8 mb-4 text-blue-500" />,
      title: "Enterprise-grade Security",
      description: "End-to-end encryption and advanced security protocols to protect your data"
    },
    {
    //   icon: <BarChart3 className="h-8 w-8 mb-4 text-blue-500" />,
      title: "Powerful Analytics",
      description: "Turn device data into actionable insights with our analytics suite"
    },
    {
    //   icon: <Cpu className="h-8 w-8 mb-4 text-blue-500" />,
      title: "Smart Automation",
      description: "Create custom automation workflows between your connected devices"
    }
  ];

  return (
    <div className={styles.section} id="features">
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    Why Choose IoTConnect
                </h2>
                <p className={styles.description}>
                    Our platform provides everything you need to manage your IoT ecosystem
                </p>
            </div>
            <div className={styles.grid}>
                {features.map((feature, index) => (
                    <div key={index} className={styles.card}>
                    {feature.icon}
                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                    <p className={styles.cardDescription}>{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

};

export default Features;

