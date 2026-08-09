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
      const originalRequest = error.config;
      // Avoid infinite retry loops: only attempt a refresh once per request
      if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { accessToken } = await useRefreshEndpoint();
          baseStore.getState().setToken(accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return axiosApi(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }

  );

export default axiosApi;
