
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

export async function useSearchWordEndpoint(terms) {
    // terms can be a string (legacy) or an array of variants
    const termList = Array.isArray(terms) ? terms : [terms];
    const requestUrl = `${API_BASE_URL}/words/search?words=${termList.map(encodeURIComponent).join(',')}`;
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
    try {
        const response = await axiosApi.post(requestUrl, {
            relatedWordId,
            relationshipType
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
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

// Get dictionary statistics
export async function useGetStatisticsEndpoint() {
    const requestUrl = `${API_BASE_URL}/words/statistics`;
    try {
        const response = await axiosApi.get(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
}

// Upload audio pronunciation for a word
export async function useUploadAudioEndpoint(wordId, audioFile) {
    const requestUrl = `${API_BASE_URL}/words/${wordId}/audio`;
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await axiosApi.post(requestUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload audio');
    }
}

// Delete audio pronunciation for a word
export async function useDeleteAudioEndpoint(wordId) {
    const requestUrl = `${API_BASE_URL}/words/${wordId}/audio`;
    try {
        const response = await axiosApi.delete(requestUrl);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete audio');
    }
}



