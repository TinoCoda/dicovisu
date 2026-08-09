import React, { useState } from "react";
import { Box, Button, Input, Text, Flex, VStack } from "@chakra-ui/react";
import { useRegisterEndpoint } from "../features/users/userApi";// For API calls
import { useAuthStore } from "../store/authStore";
import DikengaMark from "./DikengaMark";

const SignUp = ({ onSignUpSuccess }) => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSignUp = async () => {
    if (!(username && password && name)) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Registration only creates the account (always as a plain learner —
      // the backend ignores any role a signup request tries to claim).
      // Immediately log in with the same credentials so the person lands
      // straight in the app instead of being bounced back to a blank
      // login form they'd have to fill in a second time.
      await useRegisterEndpoint(username, password, name);
      await login(username, password);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
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
            Sign Up
          </Text>
        </VStack>
        {error && (
          <Text color="red.400" fontSize="sm" mb="4" textAlign="center">
            {error}
          </Text>
        )}
        <Input
          placeholder="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          mb="4"
          bg="bg-canvas"
        />
        <Input
          placeholder="Username"
          type="username"
          value={username}
          onChange={(e) => setusername(e.target.value)}
          mb="4"
          bg="bg-canvas"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="4"
          bg="bg-canvas"
        />
        <Button colorScheme="blue" w="full" onClick={handleSignUp} isLoading={isSubmitting} loadingText="Signing up...">
          Sign Up
        </Button>
        <Button variant="link" colorScheme="blue" onClick={onSignUpSuccess} mt="4">
          Already have an account? Login
        </Button>
      </Box>
    </Flex>
  );
};

export default SignUp;