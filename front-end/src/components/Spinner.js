import React from 'react';
import styles from './styles/spinner.module.css';

const Spinner = ({ size = 30 }) => {
  return (
    <div
      className={styles.loader}
      style={{ width: size, height: size, borderWidth: size / 7.5 }} // Adjusting size dynamically
    ></div>
  );
};

export default Spinner;
