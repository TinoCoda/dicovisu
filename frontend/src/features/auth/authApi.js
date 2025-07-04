import axios from 'axios';

import { baseStore } from '../../store/global';

const API_BASE_URL = '/api'; // früher war's 'http://localhost:5000/api'



export async function useLoginEndpoint(username, password) {
    const requestUrl = `${API_BASE_URL}/auth/login`;
    
    console.log("Attempting to log in with username/api: ", username); // Debugging log
    console.log("Attempting to log in with password/api: ","*****"); // Debugging log

    try {
        console.log("logging in...");
        const response = await axios.post(requestUrl, 
        { username, 
          password 
        },
        {
            withCredentials: true // Necessary to receive cookies
        });

        if(response.status == 200) {
            //accessToken=response.data.accessToken; 
            baseStore.getState().setToken(response.data.accessToken); // Update the global store
            //const localAccessToken =baseStore.getState().token; // Get the access token from the global store
            
            baseStore.getState().setUser(response.data.user); // Update the user in the global store
            baseStore.getState().setIsAuthenticated(true); // Update the authentication status in the global store
            console.log("User authenticated:", baseStore.getState().user);
            // Update Zustand store with the new access token
            //localStorage.setItem('accessToken', baseStore.getState().token); // Optionally store in localStorage

        }else{
            console.error("Login failed with status:", response.status);
            baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
            baseStore.getState().setUser(null); // Clear user data in the global store
            console.log("User not authenticated, clearing user data");
        }
        return response;
    } catch (error) {
       
        baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
        baseStore.getState().setUser(null); // Clear user data in the global store
        console.log("User not authenticated, clearing user data");
        throw new Error(error.message || 'Login failed');
    }
}

export async function useRefreshEndpoint() {
    console.log("Refreshing access token...");
    const requestUrl = `${API_BASE_URL}/auth/refresh`;
    try {
        const response = await axios.get(requestUrl, {
            withCredentials: true, // Needed to send the HttpOnly cookie
        });
        console.log("Response from refresh endpoint:", response.data);

        const newAccessToken = response.data.accessToken;
        console.log("New access token received:", newAccessToken);
        if (!newAccessToken) {
            baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
            throw new Error('No access token received from refresh endpoint');
        }

        // Update the Zustand store
        baseStore.getState().setToken(newAccessToken); // Update the global store
        console.log("Updated access token in Zustand store after refresh:", baseStore.getState().token);
        baseStore.getState().setIsAuthenticated(true); // Ensure the user is authenticated

       
        console.log("New access token saved in Zustand store and localStorage:", newAccessToken);

        return newAccessToken;
    } catch (error) {
        throw new Error(`${error.message}\n${error.stack}` || 'Refresh token failed');
    }
}

export async function useLogoutEndpoint() {
    const requestUrl = `${API_BASE_URL}/auth/logout`;
    try {
        const response = await axios.post(requestUrl);
        baseStore.getState().setToken(null); // Clear the token in the global store
        baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
        baseStore.getState().setUser(null); // Clear user data in the global store
        return response;
    } catch (error) {
        throw new Error(error.message || 'Logout failed');
    }
}
