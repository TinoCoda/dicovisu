import React, { useState } from "react";
import { Box, Button, Input, Text, Flex, useColorModeValue } from "@chakra-ui/react";
import axios from "axios"; // For API calls

const SignUp = ({ onSignUpSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [invitationCode, setInvitationCode] = useState(""); // New state for invitation code
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validateInvitationCode = async (code) => {
    try {
      // Call the backend to validate the invitation code
      const response = await axios.post("http://localhost:2000/api/invitations/validate", {
        code,
      });
      return response.data.success; // Return true if the code is valid
    } catch (err) {
      console.error("Error validating invitation code:", err);
      return false; // Return false if validation fails
    }
  };

  const handleSignUp = async () => {
    try {
      // Validate the invitation code first
      const isValidCode = await validateInvitationCode(invitationCode);
      if (!isValidCode) {
        setError("Invalid or expired invitation code.");
        setSuccess(null);
        return;
      }

      // Simulate sign-up logic (replace with actual API call)
      if (email && password && name) {
        setSuccess("Account created successfully! You can now log in.");
        setError(null);
        setTimeout(() => onSignUpSuccess(), 2000); // Switch back to login after success
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

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
      <Box
        maxW="400px"
        w="full"
        p="6"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg={cardBgColor}
      >
        <Text fontSize="2xl" fontWeight="bold" mb="4" textAlign="center">
          Sign Up
        </Text>
        {error && (
          <Text color="red.500" fontSize="sm" mb="4" textAlign="center">
            {error}
          </Text>
        )}
        {success && (
          <Text color="green.500" fontSize="sm" mb="4" textAlign="center">
            {success}
          </Text>
        )}
        <Input
          placeholder="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          mb="4"
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb="4"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="4"
        />
        <Input
          placeholder="Invitation Code"
          type="text"
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value)}
          mb="4"
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