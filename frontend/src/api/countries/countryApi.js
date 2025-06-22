import { SERVER_API_URL } from "../config/serverUrl";
import axios from "axios";
const API_BASE_URL = `${SERVER_API_URL}/api`; // 'http://localhost:5000/api';

export async function useFetchCountriesEndpoint() {
    try {
        const response = await axios.get(`${API_BASE_URL}/countries`, {

        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch countries');
    }
}