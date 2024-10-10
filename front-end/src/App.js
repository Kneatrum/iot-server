
import { ApiProvider } from './context/ApiContext';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Auth from './components/pages/Auth.js';
import Admin from './components/pages/Admin.js';
import Login from './components/pages/Login';
import Register from './components/pages/Register.js';
import Reset from './components/pages/Reset';
import Demo from './components/pages/Demo';
import Dashboard from './components/pages/Dashboard';
import ProtectedRoute from './components/protectedRoutes/ProtectedRoutes.js';

const App = () => {

  return (
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/" element={ <Auth/> } />
          <Route path="/admin" element={ <Admin/> } />
          <Route path="/login" element={ <Login/> } />
          <Route path="/register" element={ <Register/> } />
          <Route path="/reset" element={ <Reset/> } />
          <Route path="/demo" element={ <Demo/> } />
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard/> </ProtectedRoute> } />
        </Routes>
      </Router>
    </ApiProvider>
  );
}

export default App;