import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function FitHeader(){
    return(
      <>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="#home">Dashboard</Navbar.Brand>
          </Container>
        </Navbar>
      </>
    );
}

export default FitHeader;