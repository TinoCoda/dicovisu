import { SERVER_API_URL } from "../config/serverUrl";

import axiosApi from "../../features/auth/api";
const API_BASE_URL = `${SERVER_API_URL}/api`; // 'http://localhost:5000/api';

export async function useFetchCountriesEndpoint() {
    try {
        const response = await axiosApi.get(`${API_BASE_URL}/countries`, {

        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch countries');
    }
}

export async function useAddCountryEndpoint(country) {
    try {
        const response = await axiosApi.post(`${API_BASE_URL}/countries`, country, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add country');
    }
}