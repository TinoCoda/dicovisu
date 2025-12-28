
import { SERVER_API_URL } from '../config/serverUrl';

import axiosApi from '../../features/auth/interceptor';

const API_BASE_URL = `${SERVER_API_URL}/api`; //'http://localhost:5000/api';

export async  function useFetchWordsEndpoint() {
    const requestUrl = `${API_BASE_URL}/words`;
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
        const response = await axiosApi.post(requestUrl, word, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}



export async function useDeleteWordEndpoint(wid) {
    const requestUrl = `${API_BASE_URL}/words/${wid}`;
    try {
        const response = await axiosApi.delete(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}


export async function useUpdateWordEndpoint(wid, word) {
    const requestUrl = `${API_BASE_URL}/words/${wid}`;
    console.log("useUpdateWordEndpoint", requestUrl," ", word);
    try {
        const response = await axiosApi.put(requestUrl, word, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`${error.message} \n url=${requestUrl}\n`|| 'Failed to fetch words');
    }
}

export async function useSearchWordEndpoint(searchTerm) {
    const requestUrl = `${API_BASE_URL}/words/search?word=${searchTerm}`;
    try {
        const response = await axiosApi.get(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search words');
    }
}

// Add relationship between words
export async function useAddRelationshipEndpoint(wordId, relatedWordId, relationshipType) {
    const requestUrl = `${API_BASE_URL}/words/${wordId}/relationships`;
    console.log('Adding relationship:', { wordId, relatedWordId, relationshipType, requestUrl });
    try {
        const response = await axiosApi.post(requestUrl, {
            relatedWordId,
            relationshipType
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Add relationship response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Add relationship error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to add relationship');
    }
}

// Remove relationship between words
export async function useRemoveRelationshipEndpoint(wordId, relatedWordId) {
    const requestUrl = `${API_BASE_URL}/words/${wordId}/relationships/${relatedWordId}`;
    try {
        const response = await axiosApi.delete(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to remove relationship');
    }
}



