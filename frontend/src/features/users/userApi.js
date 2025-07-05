import axios from "axios";



const API_BASE_URL = '/api';

export async function useRegisterEndpoint(username, password) {
    const requestUrl = `${API_BASE_URL}/users/register`;
    try {
        const response = await axios.post(requestUrl, { username, password });
        return response;
    } catch (error) {
        throw new Error(error.message || 'Registration failed');
    }
}