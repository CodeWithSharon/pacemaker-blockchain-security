// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages & Components
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import NurseDashboard from './components/NurseDashboard';

// Admin Sub-pages
import RegisterNurse from './pages/RegisterNurse';
import RegisterTechnician from './pages/RegisterTechnician';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import Appointments from './pages/Appointments';
import IDSAlerts from './pages/IDSAlerts';
import FirmwareUpdate from './pages/FirmwareUpdate';
import ViewPatientInfo from './pages/ViewPatientInfo';
import Settings from './pages/Settings';
import SafeCommands from './pages/SafeCommands';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard Routes with AdminDashboard as the layout component */}
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          {/* This index route will be the default content for /admin-dashboard */}
          <Route index element={<div>Welcome to the Admin Dashboard! Select a page from the sidebar.</div>} />
          <Route path="register-nurse" element={<RegisterNurse />} />
          <Route path="register-technician" element={<RegisterTechnician />} />
          <Route path="register-patient" element={<RegisterPatient />} />
          <Route path="register-doctor" element={<RegisterDoctor />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="ids-alerts" element={<IDSAlerts />} />
          <Route path="firmware-update" element={<FirmwareUpdate />} />
          <Route path="view-patient-info" element={<ViewPatientInfo />} />
          <Route path="settings" element={<Settings />} />
          <Route path="safe-commands" element={<SafeCommands />} />
        </Route>

        {/* Other Role Dashboards */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/technician-dashboard" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />
        <Route path="/nurse-dashboard" element={<ProtectedRoute><NurseDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;