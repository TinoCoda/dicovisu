import axios from 'axios';
import { SERVER_API_URL } from '../../api/config/serverUrl';
import { baseStore } from '../../store/global';

import { useRefreshEndpoint } from './authApi'; // Assuming you have a function to refresh the token

const axiosApi = axios.create({
  baseURL: `${SERVER_API_URL}/api`, // 'http://localhost:5000/api',
});

// Add a request interceptor
axiosApi.interceptors.request.use(
  (config) => {
   
    console.log("Axios Api:::::Request interceptor triggered");
    const token = baseStore.getState().token; 
    console.log("Axios Api:::::Current access token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
     
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosApi.interceptors.response.use(
    (response) => response,
    async (error) => {   
      console.log("Axios Api:::::Response interceptor triggered");
      const originalRequest = error.config;
      // it means the token has expired and we need to refresh it
      if (error.response.status === 401 || error.response.status===403 ) { 
        console.log("Axios Api:::::Unauthorized error detected, attempting to refresh token");
        originalRequest._retry = true;
  
        try {
          //const refreshToken = localStorage.getItem('refreshToken');
          const refreshResponse = await useRefreshEndpoint(); // Call your refresh token function
          baseStore.getState().setToken(refreshResponse); //
         
          console.log("Axios Api::::: token from store:::",baseStore.getState().token)
          const token  = refreshResponse; // Assuming the response contains a token field
  
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log("Axios Api:::::Retrying original request with new token:", originalRequest.headers.Authorization);
          return axios(originalRequest);
        } catch (error) {
          // Handle refresh token error or redirect to login
          console.error("Axios Api:::::Error refreshing token:", error);
        }
      }
  
      return Promise.reject(error);
    }
 
  );  

export default axiosApi;
