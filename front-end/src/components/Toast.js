import React, { useState, useEffect } from 'react';
import styles from './styles/toast.module.css'; // Import the CSS module

const ToastNotification = ({ message, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`${styles.toast} ${show ? styles.show : ''}`}>
      {message}
    </div>
  );
};

export default ToastNotification;
