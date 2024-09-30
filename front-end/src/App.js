import SleepingLine from './components/charts/SleepingLine';
import Bar from './components/charts/Bar';
import ActionChart from './components/charts/ActionChart';
import FitHeader from './components/FitHeader';
import SleepSummary from './components/charts/SleepSummary';
import HeartChart from './components/charts/HeartChart';
import {NightSleepCard, AvgHeartRate, AvgOxygenSaturation, Steps} from './components/Cards';
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
          <Route path="/dashboard" element={ <Dashboard/> } />
        </Routes>
      </Router>
    </ApiProvider>
  );
}

export default App;