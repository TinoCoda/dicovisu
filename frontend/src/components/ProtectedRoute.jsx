import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth(); // Assuming 'loading' indicates auth state is being determined

    if (loading) {
        // Optional: Show a loading spinner or some placeholder while auth state is being verified
        // For now, returning null or a simple text
        return <p>Loading authentication state...</p>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
