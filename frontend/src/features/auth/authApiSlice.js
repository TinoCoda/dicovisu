import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
let accessToken = null; // Initialize accessToken to null


export async function  useLoginEndpoint(username, password) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, 
        { username, 
          password 
        },
        {
            withCredentials: true // Necessary to receive cookies
        });

        if(response.status !== 200) {
            accessToken=response.data.accessToken; 
            const refreshCookie=response.headers['jwt'];
            console.log("refreshCookie", refreshCookie);    

        }
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
}

export async function useRefreshEndpoint() {
    try {
        const headers = {};

        // If accessToken is provided, use it in the Authorization header
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
            headers,
            withCredentials: true, // Include cookies in the request
        });

        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Refresh token failed');
    }
}

export async function useLogoutEndpoint() {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/logout`);
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
}

export const authApiSlice = {
     useLoginEndpoint,
     useRefreshEndpoint,
     useLogoutEndpoint
} ;