import React, { useState } from 'react';
import styles from './styles/hamburgerMenu.module.css'; // Adjust the path as necessary

const HamburgerMenu = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <nav className={`${styles.menu} ${isOpen ? styles.show : ''}`}>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault(); // Optional: Prevent default navigation if you're handling it via JS
                    item.onClick();
                    console.log(`Clicked on ${item.label}`);
                  }
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
};

export default HamburgerMenu;
