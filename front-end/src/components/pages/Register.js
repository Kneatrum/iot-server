import React, { useState } from 'react';
import styles from '../styles/register.module.css';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Toast from '../Toast.js';
import Spinner from '../Spinner.js';

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
    setLoading(true);
    setErrorMessage('');
    try {
      
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
        
        {errorMessage && ( <Toast message={errorMessage}/> )}


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
        
        <div className={styles.spinnerContainer}>
          {loading ? (< Spinner size={20} />) : ''}
        </div>

        <button type="submit" className={styles.button}>
          Submit
        </button>

      </form>
    </div>
  );
};

export default Register;
