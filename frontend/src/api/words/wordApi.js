import axios from 'axios';
import { SERVER_API_URL } from '../config/serverUrl';

import axiosApi from '../../features/auth/api';

const API_BASE_URL = `${SERVER_API_URL}/api`; //'http://localhost:5000/api';

export async  function useFetchWordsEndpoint() {
    const requestUrl = `/words`;
    try {
        const response = await axiosApi.get(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}


export async function useAddWordEndpoint(word) {
    const requestUrl = `${API_BASE_URL}/words`;
    try {
        const response = await axios.post(requestUrl, word, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}



export async function useDeleteWordEndpoint(wid) {
    const requestUrl = `${API_BASE_URL}/words/${wid}`;
    try {
        const response = await axios.delete(requestUrl);
        return response.data;
    } catch (error) {
        throw new new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}


export async function useUpdateWordEndpoint(wid, word) {
    const requestUrl = `${API_BASE_URL}/words/${wid}`;
    try {
        const response = await axios.put(requestUrl, word, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}

export async function useSearchWordEndpoint(searchTerm) {
    const requestUrl = `${API_BASE_URL}/words/search?word=${searchTerm}`;
    try {
        const response = await axios.get(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search words');
    }
}


