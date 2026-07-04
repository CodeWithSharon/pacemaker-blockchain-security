// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    // Always re-check authentication when the location changes
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, [location]);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
