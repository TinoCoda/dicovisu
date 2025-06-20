import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

import { accessToken } from './api';


export async function  useLoginEndpoint(username, password) {
    const requestUrl = `${API_BASE_URL}/auth/login`;
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
            accessToken=response.data.accessToken; 
            localStorage.setItem('accessToken', accessToken); // Optionally store in localStorage

        }
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
}

export async function useRefreshEndpoint() {
    const requestUrl = `${API_BASE_URL}/auth/refresh`;
    try {
        const response = await axios.get(requestUrl, {
            withCredentials: true, // Needed to send the HttpOnly cookie
        });

        // Save new access token from response
        const newAccessToken = response.data.accessToken;

        // Optional: store it in memory or context
        // Example: update your accessToken variable
        accessToken = newAccessToken;
        localStorage.setItem('accessToken', newAccessToken); // Optionally store in localStorage
        console.log("New access token received:", accessToken);

        return newAccessToken;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Refresh token failed');
    }
}

export async function useLogoutEndpoint() {
    const requestUrl = `${API_BASE_URL}/auth/logout`;
    try {
        const response = await axios.post(requestUrl);
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
}
