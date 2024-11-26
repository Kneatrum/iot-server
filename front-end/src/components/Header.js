import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import styles from './styles/header.module.css';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [tag, setTag] = useState('Log In');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/status');
        if(response.data.isAuthenticated){
          setTag('Log Out');
        }
      } catch (error) {
        console.log('Something went wrong');
      }
    }
    checkAuth();
  }, [tag]);

  
  const handleButtonClick = async () => {
    try {
      const response = await api.post('/logout');
      if(response.status === 200){
        const data = await response.data;
        console.log(data);
        setTag((prevTag) => (prevTag === "Log In" ? "Log Out" : "Log In"));
        navigate('/login');
      }
    } catch(err) {
      console.log('Unable to log out')
    }
  };

  return (
    <>
      <Navbar className={styles.header}>
        <Container>
          <Navbar.Brand as={Link} to="/" className={styles["header-title"]}>Dashboard</Navbar.Brand>
          <div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleButtonClick} // Set the onClick event
            >
              {tag}
            </button>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
