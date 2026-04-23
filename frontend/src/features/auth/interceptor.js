import axios from 'axios';
import { SERVER_API_URL } from '../../api/config/serverUrl';
import { baseStore } from '../../store/global';

import { useRefreshEndpoint } from './authApi'; // Assuming you have a function to refresh the token

const axiosApi = axios.create({
  baseURL: `${SERVER_API_URL}`, // 'http://localhost:5000/api', set it to nothing
});

// Add a request interceptor
axiosApi.interceptors.request.use(
  (config) => {
   
    console.log("Axios Api:::::Request interceptor triggered");
    const token = baseStore.getState().token; 
    
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
      // Avoid infinite retry loops: only attempt a refresh once per request
      if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
        console.log("Axios Api:::::Unauthorized error detected, attempting to refresh token");
        originalRequest._retry = true;
  
        try {
          //const refreshToken = localStorage.getItem('refreshToken');
          const refreshResponse = await useRefreshEndpoint(); // Call your refresh token function
          baseStore.getState().setToken(refreshResponse); //
          const token  = refreshResponse; // Assuming the response contains a token field
  
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return axiosApi(originalRequest);
        } catch (refreshError) {
          console.error("Axios Api:::::Error refreshing token:", refreshError);
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
 
  );  

export default axiosApi;
