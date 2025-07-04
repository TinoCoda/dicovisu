import React, { useRef, useState } from "react";
import { Box, Button, Input, Text, Flex, useColorModeValue } from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";
import SignUp from "./SignUp"; // Import the SignUp component

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for password
  const [error, setError] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between Login and SignUp
  const { login } = useAuthStore(); // Destructure login from the auth store

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await login(username, password); // Call the login function from the auth store
      const restrictedResponse= {
        username: response.data.username, 
        roles: response.data.roles, 
        message: response.data.message 

      };
      console.log("Login response:",restrictedResponse); // Log the response for debugging
      setUsername(''); // Clear username input field
      setPassword(''); // Clear password input field
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  // Define color mode values
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");

  return showSignUp ? (
    <SignUp onSignUpSuccess={() => setShowSignUp(false)} /> // Show SignUp component
  ) : (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
      <Box
        maxW="400px"
        w="full"
        p="6"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg={cardBgColor}
        maxH={"90vh"}
      >
        <Text fontSize="2xl" fontWeight="bold" mb="4" textAlign="center">
          Login
        </Text>
        {error && (
          <Text color="red.500" fontSize="sm" mb="4" textAlign="center">
            {error}
          </Text>
        )}
        <Input
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update the username state
          mb="4"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update the password state
          mb="4"
        />
        <Button colorScheme="blue" w="full" onClick={handleLogin} mb="4">
          Login
        </Button>
        <Button variant="link" colorScheme="blue" onClick={() => setShowSignUp(true)}>
          Don't have an account? Sign Up
        </Button>
      </Box>
    </Flex>
  );
};

export default Login;