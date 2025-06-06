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

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            toast({
                title: 'Login Successful',
                description: "Welcome back!",
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/'); // Redirect to home page or dashboard
        } catch (err) {
            // Error is already set in AuthContext, but we can toast it too
            toast({
                title: 'Login Failed',
                description: err.message || 'An error occurred during login.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
            <Heading as="h2" size="lg" textAlign="center" mb={6}>
                Login
            </Heading>
            {error && ( // Display error from AuthContext if any (e.g. general error)
                <Text color="red.500" mb={4} textAlign="center">
                    {error}
                </Text>
            )}
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl id="username" isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </FormControl>
                    <FormControl id="password" isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={loading}
                        isDisabled={loading}
                        width="full"
                    >
                        Login
                    </Button>
                </Stack>
            </form>
            <Text mt={4} textAlign="center">
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="teal.500">
                    Sign up here
                </Link>
            </Text>
        </Box>
    );
};

export default LoginPage;
