import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.user?.role; // Get user's role from token

    // Temporarily disable email verification check for testing
    // const isVerified = decodedToken.user?.isVerified;
    // if (!isVerified) {
    //   // If not verified, redirect to a page that explains verification
    //   return <Navigate to="/login?message=unverified" />;
    // }

    if (requiredRole && userRole !== requiredRole) {
      // If a required role is specified and user doesn't have it, redirect to unauthorized
      return <Navigate to="/login?message=unauthorized" />;
    }

    return children;
  } catch (error) {
    console.error('Error decoding token or invalid token:', error);
    localStorage.removeItem('token'); // Clear invalid token
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
