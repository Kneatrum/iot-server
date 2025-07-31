
// src/components/LandingPage.js

import styles from '../styles/landingHeader.module.css'
import React, { useState } from 'react';
import HamburgerMenu from '../HamburgerMenu';

const LandingPageHeader = ({menuItems, activeTab, setActiveTab, authActiveTab, setAuthActiveTab}) => {

    
  return (
    <nav className={styles.navbar}>
        <div className={styles.container}>
            <div className={styles.navContent}>
                <div className={styles.brand}>
                    <span className={styles.logo}>Dopesilicon</span>
                </div>
                <div className={styles.navItems}>
                    <div className={styles.navLinks}>
                        {
                            menuItems.map((item) => {
                                const labelKey = item.label.replace(/\s+/g, '').toLowerCase();
                                return (
                                    labelKey !== 'login' && labelKey !== 'signup' ? (
                                        <button 
                                        key={labelKey}
                                        className={`${styles.navLink} ${activeTab === labelKey ? styles.navLinkActive : ''}`}
                                        onClick={() => {
                                            setActiveTab(labelKey);
                                            document.getElementById(labelKey).scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        >
                                        {item.label}
                                        </button>
                                    ) : (
                                        <div className={styles.authButtons} key={labelKey}>
                                        <button 
                                            className={`${styles.authButton} ${activeTab === labelKey ? styles.authButtonActive : ''}`}
                                            onClick={() => {
                                            setAuthActiveTab(labelKey);
                                            setActiveTab(labelKey);
                                            document.getElementById(labelKey).scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                        </div>
                                    )
                                );
                            })
                        }

                    </div>

                    <div className={styles.hamburgerMenu}>
                        <HamburgerMenu menuItems={menuItems}/>
                    </div>

                </div>
            </div>
        </div>
    </nav>
  );

};

export default LandingPageHeader;

