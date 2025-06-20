import axios from 'axios';
import { SERVER_API_URL } from '../../api/config/serverUrl';
export  let accessToken =null; 


import { useRefreshEndpoint } from './authApi'; // Assuming you have a function to refresh the token

const axiosApi = axios.create({
  baseURL: `${SERVER_API_URL}/api`, // 'http://localhost:5000/api',
});

// Add a request interceptor
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Get the current access token from the global variable
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
      const originalRequest = error.config;
  
      // If the error status is 401 and there is no originalRequest._retry flag,
      // it means the token has expired and we need to refresh it
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          //const refreshToken = localStorage.getItem('refreshToken');
          const accessToken = await useRefreshEndpoint(); // Call your refresh token function
          const { token } = accessToken; // Assuming the response contains a token field
          console.log(" Axios Api:::::New access token received:", token);
          //localStorage.setItem('token', token);
          accessToken = token; // Update the global accessToken variable
  
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (error) {
          // Handle refresh token error or redirect to login
        }
      }
  
      return Promise.reject(error);
    }
 
  );  

export default axiosApi;
