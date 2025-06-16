import React, { useRef,useState, useEffect } from "react";
import { Box, Button, Input, Text, Flex, useColorModeValue } from "@chakra-ui/react";
//import useUsersStore from "../stores/usersStore";
import { setCredentials } from "../features/auth/authSlice.js";
import { useLoginMutation } from "../features/auth/authApiSlice.js";


import SignUp from "./SignUp"; // Import the SignUp component

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation()
  const [error, setError] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between Login and SignUp
  const userRef = useRef()
  const errRef = useRef()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')

  // Destructure users, getUsers, and authenticateUser from the store




  const handleLogin = async (e) => {
    e.preventDefault() // prevent default form submission behavior
    try{
        const response = await login({ username, password }).unwrap() // unwrap the response to get the data directly
        console.log("Login response:", response) // log the response for debugging
        dispatch(setCredentials({ ...response })) // set user credentials in the Redux store
        setUsername('') // clear username input field
        setPassword('') // clear password input field
        //navigate('/dash') // navigate to the dashboard on successful login

    }catch(err){
        if (!err.status) {
            //setErrMsg('No Server Response');
            console.error('No Server Response:', err);
        } else if (err.status === 400) {
          console.error('Missing Username or Password:', err);
            //setErrMsg('Missing Username or Password');
        } else if (err.status === 401) {
           // setErrMsg('Unauthorized');
            console.error('Unauthorized:', err);
        } else {
            setErrMsg(err.data?.message);
        }
        //errRef.current.focus(); 

    }


}

  /*

    const handleLogin = async () => {
      console.log("Attempting login with email:", email); // Debugging log

      try {
        // Call authenticateUser and get the result
        const isAuthenticated = await authenticateUser({ mail: email, password });

        // Check if the user is authenticated OR matches hardcoded credentials
        if (isAuthenticated || (email === "admin@example.com" && password === "password")) {
          localStorage.setItem("authToken", "your-auth-token"); // Save token
          onLogin(); // Notify parent component
        } else {
          setError("Invalid email or password");
        }
      } catch (err) {
        setError("Authentication failed. Please try again.");
        console.error("Error during authentication:", err);
      }
    };

  */

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