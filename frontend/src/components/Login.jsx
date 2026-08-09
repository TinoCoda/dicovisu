import React, { useRef, useState } from "react";
import { Box, Button, Input, Text, Flex, VStack } from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";
import SignUp from "./SignUp"; // Import the SignUp component
import DikengaMark from "./DikengaMark";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for password
  const [error, setError] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between Login and SignUp
  const { login } = useAuthStore(); // Destructure login from the auth store

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      await login(username, password); // Call the login function from the auth store
      setUsername(''); // Clear username input field
      setPassword(''); // Clear password input field
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return showSignUp ? (
    <SignUp onSignUpSuccess={() => setShowSignUp(false)} /> // Show SignUp component
  ) : (
    <Flex className="canvas-texture" minH="100vh" align="center" justify="center" bg="bg-canvas" px={4}>
      <Box
        maxW="400px"
        w="full"
        p="8"
        borderWidth="1px"
        borderColor="border-default"
        borderRadius="lg"
        boxShadow="lg"
        bg="bg-surface"
      >
        <VStack spacing={1} mb="6">
          <DikengaMark boxSize="34px" color="blue.400" />
          <Text fontFamily="heading" fontSize="2xl" fontWeight="600" textAlign="center" color="text-primary">
            Longukanu
          </Text>
          <Text fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" color="text-muted">
            si Mbembu situ
          </Text>
        </VStack>
        {error && (
          <Text color="red.400" fontSize="sm" mb="4" textAlign="center">
            {error}
          </Text>
        )}
        <Input
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update the username state
          mb="4"
          bg="bg-canvas"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update the password state
          mb="4"
          bg="bg-canvas"
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