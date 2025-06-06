import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ChakraProvider is usually in main.jsx, if not, it should be here.
// For this exercise, we assume ChakraProvider and AuthProvider are correctly set up in main.jsx
// import { ChakraProvider } from '@chakra-ui/react';
import { Box, useColorModeValue } from '@chakra-ui/react'; // Keep existing imports if used

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddNewEntry from './pages/AddNewEntry'; // Assuming this will be a protected route
import DetailPage from './pages/DetailPage';   // Assuming this will be a protected route
import AddNewLANG from './pages/AddNewLANG';   // Assuming this will be a protected route

// Import Components
import NavBar from './components/NavBar'; // Keep existing NavBar import
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
    const { isAuthenticated, loading } = useAuth();
    const bgColor = useColorModeValue("gray.200", "gray.700"); // Keep existing theme value

    // This loading check helps prevent flashing the login page if the user is already authenticated
    // and AuthContext is just initializing.
    if (loading) {
        return (
            <Box bg={bgColor} p={8} h={"100vh"} display="flex" justifyContent="center" alignItems="center">
                <p>Loading application...</p>
            </Box>
        );
    }

    return (
        // Router is now part of this component as per the plan.
        // AuthProvider should wrap this App component, typically in main.jsx.
        <Router>
            <Box bg={bgColor} p={8} h={"100vh"}> {/* Retain existing Box styling */}
                <NavBar />
                <Routes>
                    {/* Public routes */}
                    {/* Redirect authenticated users from login/register to home */}
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
                    />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path='/add' element={<AddNewEntry/>} />
                        <Route path='/details' element={<DetailPage/>} /> {/* Consider if this needs an :id param */}
                        {/* <Route path='/details/:id' element={<DetailPage/>} /> */}
                        <Route path='/languages' element={<AddNewLANG/>} />
                        {/* Add other protected routes from your original setup here */}
                    </Route>

                    {/* Fallback for unmatched routes - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;
