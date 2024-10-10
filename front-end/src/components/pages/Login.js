import React, { useState } from 'react';
import styles from '../styles/login.module.css';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Toast from '../Toast.js';
import Spinner from '../Spinner.js';

const Login = () => {
  const [formData, setFormData] = useState({
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
      const response = await api.post('/login', formData);
      
      if (response.status === 200) {
        const data = await response.data;
        console.log(data)
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage(error.response.data.error);
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

        <div className={styles.spinnerContainer}>
          {loading ? (< Spinner size={20} />) : ''}
        </div>

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

export default Login;
