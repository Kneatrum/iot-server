
import { ApiProvider } from './context/ApiContext';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LandingPage from './components/pages/LandingPage.js';
import Admin from './components/pages/Admin.js';
import Login from './components/pages/Login';
import Register from './components/pages/Register.js';
import PlansPage from './components/pages/PlansPage.js';
import Payments from './components/pages/Payments.js';
import Reset from './components/pages/Reset';
import Demo from './components/pages/Demo';
import { Dashboard } from './components/pages/Dashboard';
import ProtectedRoute from './components/protectedRoutes/ProtectedRoutes.js';
import { Provider } from "react-redux";
import store from './components/store';


const App = () => {

  return (
    <Provider store={store}>
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/" element={ <LandingPage/> } />
          <Route path="/admin" element={ <Admin/> } />
          <Route path="/login" element={ <Login/> } />
          <Route path="/register" element={ <Register/> } />
          <Route path="/plans" element={ <ProtectedRoute> <PlansPage/> </ProtectedRoute>  } />
          <Route path="/payments" element={ <ProtectedRoute> <Payments/> </ProtectedRoute> } />
          <Route path="/reset" element={ <Reset/> } />
          <Route path="/demo" element={ <Demo/> } />
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard/> </ProtectedRoute> } />
        </Routes>
      </Router>
    </ApiProvider>
    </Provider>
  );
}

export default App;