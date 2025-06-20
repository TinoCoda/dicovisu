import { SERVER_API_URL } from "../config/serverUrl";
import axios from "axios";
const API_BASE_URL = `${SERVER_API_URL}/api`; // 'http://localhost:5000/api';

export async function useFetchLanguagesEndpoint() {
    try {
        const response = await axios.get(`${API_BASE_URL}/languages`, {
            headers: {
                'Origin': window.location.origin // Explicitly set the Origin header
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch languages');
    }
}


export async function useAddLanguageEndpoint(language) {
    try {
        const response = await axios.post(`${API_BASE_URL}/languages`, language, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add language');
    }
}

export async function useDeleteLanguageEndpoint(lid) {
    try {
        const response = await axios.delete(`${API_BASE_URL}/languages/${lid}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete language');
    }
}


export async function useUpdateLanguageEndpoint(lid, language) {
    try {
        const response = await axios.put(`${API_BASE_URL}/languages/${lid}`, language, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update language');
    }
}
