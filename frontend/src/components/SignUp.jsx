import React, { useState } from "react";
import { Box, Button, Input, Text, Flex, VStack } from "@chakra-ui/react";
import { useRegisterEndpoint } from "../features/users/userApi";// For API calls
import DikengaMark from "./DikengaMark";

const SignUp = ({ onSignUpSuccess }) => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const handleSignUp = async () => {
    try {
      // Validate the invitation code first


      // Simulate sign-up logic (replace with actual API call)
      if (username && password && name) {
        const response = await useRegisterEndpoint(username, password);

        if(response.status===201){
          setSuccess("Account created successfully! You can now log in.");
          setError(null);
          setTimeout(() => onSignUpSuccess(), 2000); // Switch back to login after success


        }else{
          console.error("SignUp error:", response);
          setError(response.message || "Failed to create account. Please try again.");
          setSuccess(null);
        }
        
      } else {
        setError("All fields are required.");
        setSuccess(null);
      }
    } catch (err) {
      setError("An error occurred during sign up. Please try again.");
      setSuccess(null);
      console.error("Error during sign up:", err);
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
        {success && (
          <Text color="teal.400" fontSize="sm" mb="4" textAlign="center">
            {success}
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
        <Button colorScheme="blue" w="full" onClick={handleSignUp}>
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