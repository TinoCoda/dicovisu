import axios from 'axios';

import { baseStore } from '../../store/global';

const API_BASE_URL = '/api'; // früher war's 'http://localhost:5000/api'



export async function useLoginEndpoint(username, password) {
    const requestUrl = `${API_BASE_URL}/auth/login`;

    try {
        const response = await axios.post(requestUrl,
        { username,
          password
        },
        {
            withCredentials: true // Necessary to receive cookies
        });

        if(response.status == 200) {
            baseStore.getState().setToken(response.data.accessToken); // Update the global store
            baseStore.getState().setUser(response.data.username); // Update the user in the global store
            baseStore.getState().setIsAuthenticated(true); // Update the authentication status in the global store
        }else{
            baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
            baseStore.getState().setUser(null); // Clear user data in the global store
        }
        return response;
    } catch (error) {
        baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
        baseStore.getState().setUser(null); // Clear user data in the global store
        throw new Error(error.message || 'Login failed');
    }
}

export async function useRefreshEndpoint() {
    const requestUrl = `${API_BASE_URL}/auth/refresh`;
    try {
        const response = await axios.get(requestUrl, {
            withCredentials: true, // Needed to send the HttpOnly cookie
        });

        const { accessToken, username, roles } = response.data;

        if (!accessToken) {
            baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
            throw new Error('No access token received from refresh endpoint');
        }

        // Update the Zustand store
        baseStore.getState().setToken(accessToken);
        baseStore.getState().setUser(username);
        baseStore.getState().setIsAuthenticated(true);

        return { accessToken, username, roles };
    } catch (error) {
        throw new Error(error.message || 'Refresh token failed');
    }
}

export async function useLogoutEndpoint() {
    const requestUrl = `${API_BASE_URL}/auth/logout`;
    try {
        const response = await axios.post(requestUrl);
        baseStore.getState().setToken(null); // Clear the token in the global store
        baseStore.getState().setIsAuthenticated(false); // Update the authentication status in the global store
        baseStore.getState().setUser(null); // Clear user data in the global store
        localStorage.clear(); // Clear local storage

        return response;
    } catch (error) {
        throw new Error(error.message || 'Logout failed');
    }
}
