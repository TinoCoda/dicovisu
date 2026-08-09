import axios from "axios";
import axiosApi from "../auth/interceptor";

const API_BASE_URL = '/api';

export async function useRegisterEndpoint(username, password, name) {
    const requestUrl = `${API_BASE_URL}/users/register`;
    try {
        const response = await axios.post(requestUrl, { username, password, name });
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
}

// Admin-only — list every user (routes require verifyJWT + verifyRoles).
export async function useFetchUsersEndpoint() {
    const requestUrl = `${API_BASE_URL}/users`;
    try {
        const response = await axiosApi.get(requestUrl);
        return response.data; // bare array, not { success, data }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
}

// Admin-only — partial update, here used to change just a user's roles.
export async function useUpdateUserRolesEndpoint(userId, roles) {
    const requestUrl = `${API_BASE_URL}/users/${userId}`;
    try {
        const response = await axiosApi.put(requestUrl, { roles });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to update user');
    }
}

// Admin-only — partial update, here used to reset a user's password.
export async function useUpdateUserPasswordEndpoint(userId, password) {
    const requestUrl = `${API_BASE_URL}/users/${userId}`;
    try {
        const response = await axiosApi.put(requestUrl, { password });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to reset password');
    }
}
