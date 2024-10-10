import React, { useState } from 'react';
import styles from '../styles/auth.module.css';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  }); 

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      console.log('Sign up data:', formData);
      const response = await api.post('/register', formData);
  
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
      } else {
       
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        
      {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
      )}


        <h1 className={styles.title}>Register</h1>

        <input
          type="text"
          name="userName"
          placeholder="Username"
          value={formData.userName}
          onChange={handleChange}
          className={styles.input}
          required
        />

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
        
        {loading ? 'Logging in...' : ''}

        <button type="submit" className={styles.button}>
          Submit
        </button>

      </form>
    </div>
  );
};

export default Register;
