import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './components/HomePage';
import DonorDashboard from './components/DonorDashboard';
import CreateEvent from './components/CreateEvent';
import NgoDashboard from './components/NgoDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return <Navigate to="/login" />;
  }
  
  const user = JSON.parse(userInfo);
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/donor/dashboard" 
            element={
              <ProtectedRoute allowedRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/create-event" 
            element={
              <ProtectedRoute allowedRole="donor">
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ngo/dashboard" 
            element={
              <ProtectedRoute allowedRole="ngo">
                <NgoDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
