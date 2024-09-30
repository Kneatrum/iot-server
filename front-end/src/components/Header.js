import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import styles from './styles/header.module.css';
import { Link } from 'react-router-dom';

function Header() {
  const [tag, setTag] = useState("Log In");

  useEffect(() => {
    // if(userHasLoggedIn){ 
      setTag('Log Out');
    // } else{
    //   setTag('Log In');
    // }
  }, [/*userHasLoggedIn*/]);

  // Define the onClick event handler
  const handleButtonClick = () => {
    // Add your logic here
    if (tag === "Log In") {
      console.log("User logged in");
      // Perform login actions
    } else {
      console.log("User logged out");
      // Perform logout actions
    }
    
    // Toggle the button text (optional)
    setTag((prevTag) => (prevTag === "Log In" ? "Log Out" : "Log In"));
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
