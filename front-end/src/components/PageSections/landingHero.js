
// src/components/LandingPage.js

import styles from '../styles/landingHero.module.css';
// import React, { useState } from 'react';


const HeroSection = () => {
//   const [activeTab, setActiveTab] = useState("signup");

  return (
    <div className={styles.heroSection} id='home'>
        <div className={styles.container}>
            <div className={styles.heroContent}>
                <div className={styles.heroTextColumn}>
                    <h1 className={styles.heroTitle}>
                        The Complete IoT Management Platform
                    </h1>

                    <p className={styles.heroDescription}>
                        Connect, monitor, and automate your IoT devices with our powerful cloud platform. 
                        Get actionable insights and secure your IoT ecosystem.
                    </p>

                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.primaryButton}
                            // onClick={() => setActiveTab("signup")}
                        >
                            Get Started
                            {/* <ChevronRight className={styles.buttonIcon} /> */}
                        </button>
                        <button className={styles.secondaryButton}>
                            Watch Demo
                        </button>
                    </div>
                </div>
                
                <div className={styles.heroImageColumn}>
                    <div className={styles.imagePlaceholder}>
                        <img
                            src="./iotdash.jpg"
                            alt="IoT Dashboard Preview"
                            className={styles.heroImage}
                        />
                        {
                        /* 
                            <div className={styles.placeholderContent}>
                            <Cpu className={styles.placeholderIcon} />
                            <p className={styles.placeholderText}>IoT Dashboard Preview</p>
                            </div>
                        */
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

};

export default HeroSection;

