import React, { useState } from 'react';
import styles from '../styles/auth.module.css'; // Import the CSS file

const Admin = () => {
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
        <h2 className={styles.title}>Log In</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
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

        <a 
          href="/reset" 
          className={styles.forgotPassword}
        >
          Forgot Password?
        </a>
        
      </form>
    </div>
  );
};

export default Admin;
