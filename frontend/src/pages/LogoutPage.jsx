import React, { useEffect, useState } from 'react';
import { VStack, Text, Spinner, Box } from '@chakra-ui/react';

import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true); // State to track logout process
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // For redirecting after logout
  const {logout} = useAuthStore(); // Import the logout endpoint from the auth store

  useEffect(() => {
    const onLogout = async () => {
      try {
        await logout(); // Call the logout endpoint
        setMessage('Thank you for visiting this community dictionary. Feel free to contribute!');
      } catch (error) {
        setMessage('An error occurred while logging out. Please try again.');
        console.error('Logout error:', error.message);
      } finally {
        setIsLoggingOut(false); // End the logout process
        setTimeout(() => {
          navigate('/'); // Redirect to the home page after logout
        }, 3000); // Redirect after 3 seconds
      }
    };

    onLogout(); // Trigger logout on component mount
  }, [navigate]);

  return (
    <VStack spacing={4} align="center" mt={10}>
      {isLoggingOut ? (
        <Box>
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} fontSize="lg" fontWeight="bold">
            Logging out...
          </Text>
        </Box>
      ) : (
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          {message}
        </Text>
      )}
    </VStack>
  );
}

export default LogoutPage;