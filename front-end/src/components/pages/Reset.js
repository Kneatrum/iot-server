import React, { useState } from 'react';
import styles from '../styles/auth.module.css'; // Import the CSS file

const Reset = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Reset password</h1>

        <p className={styles.subtitle}>
          Enter the email address you used to register, 
          and we’ll send you instructions to reset your password.
        </p>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        
        <button 
          type="submit" 
          className={styles.button}
        >
          Submit
        </button>

        
        
      </form>
    </div>
  );
};

export default Reset;
