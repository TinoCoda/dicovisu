import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    Link,
    Button,
    Text,
    Heading,
    Spacer,
    useColorMode,
    HStack,
    IconButton
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { CiSquarePlus } from "react-icons/ci";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { DiAptana } from "react-icons/di";

const NavBar = () => {
    const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { colorMode, toggleColorMode } = useColorMode();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally show a toast message for logout failure
        }
    };

    return (
        <Box bg="teal.500" p={4} color="white" mb={6}>
            <Flex maxW="container.xl" mx="auto" align="center">
                <Heading as="h1" size="md" mr={6}>
                    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none', color: 'gray.200' }}
                        bgGradient={"linear(to-r, cyan.400, blue.500)"}
                        bgClip={"text"}
                    >
                        My Dictionary App
                    </Link>
                </Heading>

                <Link as={RouterLink} to="/" mr={4} _hover={{ color: 'gray.200' }} display={{base: "none", md: "inline-block"}}>
                    Home
                </Link>

                {isAuthenticated && (
                    <>
                        <Link as={RouterLink} to="/add-lang" mr={4} _hover={{ color: 'gray.200' }} display={{base: "none", md: "inline-block"}}>
                            <Button leftIcon={<DiAptana />} variant="ghost" colorScheme="whiteAlpha" _hover={{ bg: 'teal.600' }}>
                                Add Language
                            </Button>
                        </Link>
                        <Link as={RouterLink} to="/add" mr={4} _hover={{ color: 'gray.200' }} display={{base: "none", md: "inline-block"}}>
                             <Button leftIcon={<CiSquarePlus />} variant="ghost" colorScheme="whiteAlpha" _hover={{ bg: 'teal.600' }}>
                                Add Entry
                            </Button>
                        </Link>
                    </>
                )}

                <Spacer />

                <HStack spacing={2}>
                    <IconButton
                        aria-label="Toggle theme"
                        icon={colorMode === "light" ? <IoMoon /> : <LuSun />}
                        onClick={toggleColorMode}
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        _hover={{ bg: 'teal.600' }}
                    />

                    {isAuthenticated ? (
                        <>
                            {user && <Text mr={4} display={{base: "none", md: "inline-block"}}>Hi, {user.username || 'User'}!</Text>}
                            <Button
                                colorScheme="red"
                                variant="solid"
                                onClick={handleLogout}
                                isLoading={authLoading}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link as={RouterLink} to="/login" mr={2}>
                                <Button variant="outline" colorScheme="whiteAlpha" _hover={{ bg: 'teal.600' }}>Login</Button>
                            </Link>
                            <Link as={RouterLink} to="/register">
                                <Button variant="outline" colorScheme="whiteAlpha" _hover={{ bg: 'teal.600' }}>Register</Button>
                            </Link>
                        </>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
};

export default NavBar;
