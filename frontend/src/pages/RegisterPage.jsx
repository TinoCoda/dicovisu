import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Heading,
    Text,
    useToast,
    Link
} from '@chakra-ui/react';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // Optional: Add a confirm password field for better UX
    // const [confirmPassword, setConfirmPassword] = useState('');
    const { register, loading, error } = useAuth(); // Assuming error state in AuthContext is general
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Optional: Add password confirmation validation
        // if (password !== confirmPassword) {
        //     toast({
        //         title: 'Registration Error',
        //         description: "Passwords do not match.",
        //         status: 'error',
        //         duration: 5000,
        //         isClosable: true,
        //     });
        //     return;
        // }
        try {
            await register(username, password);
            toast({
                title: 'Registration Successful',
                description: "Your account has been created. Please login.",
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/login'); // Redirect to login page after registration
        } catch (err) {
            toast({
                title: 'Registration Failed',
                description: err.message || 'An error occurred during registration.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
            <Heading as="h2" size="lg" textAlign="center" mb={6}>
                Create Account
            </Heading>
            {error && ( // Display error from AuthContext if any (e.g. general error during registration)
                <Text color="red.500" mb={4} textAlign="center">
                    {error}
                </Text>
            )}
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl id="username-register" isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                        />
                    </FormControl>
                    <FormControl id="password-register" isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                        />
                    </FormControl>
                    {/* Optional: Confirm Password Field
                    <FormControl id="confirm-password-register" isRequired>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                        />
                    </FormControl>
                    */}
                    <Button
                        type="submit"
                        colorScheme="green"
                        isLoading={loading}
                        isDisabled={loading}
                        width="full"
                    >
                        Register
                    </Button>
                </Stack>
            </form>
            <Text mt={4} textAlign="center">
                Already have an account?{' '}
                <Link as={RouterLink} to="/login" color="teal.500">
                    Login here
                </Link>
            </Text>
        </Box>
    );
};

export default RegisterPage;
