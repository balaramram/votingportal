import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  // Token irundha mattumae ulla vidum, illana direct-ah login page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;