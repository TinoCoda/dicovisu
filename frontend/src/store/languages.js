import { create } from 'zustand'
import axiosApi from '../features/auth/interceptor';

export const useLanguageStore = create((set) => ({
    languages: [],
    setLanguages: (languages) => set({ languages }),
    addLanguage: async (language) => {
        try {
            if (!language.name || !language.code) {
                return { success: false, message: "Please fill all required fields" };
            }
            const response = await axiosApi.post('/api/languages', language);
            set((state) => ({ languages: [...state.languages, response.data.data] }))
            return { success: true, message: 'Language added successfully' };

        } catch (error) {
            var offlineNewLanguages = JSON.parse(localStorage.getItem('newLanguages')) || [];
            const offlineNewLanguagesSet = new Set(offlineNewLanguages.map((l) => l.name));
            offlineNewLanguagesSet.add(language);
            offlineNewLanguages = [...offlineNewLanguagesSet].map((l) => ({
                name: l.name,
                code: l.code,
                description: l.description,
                countries: l.countries
            }));

            localStorage.setItem('newLanguages', JSON.stringify(offlineNewLanguages));

            return ({ success: false, message: `Connection to database lost, impossible to add a new language:\n ${error.message}` });

        }

    },
    addOfflineLanguages: async () => {
        const offlineNewLanguages = JSON.parse(localStorage.getItem('newLanguages')) || [];
        try {
            if (offlineNewLanguages.length === 0) return;
            for (const language of offlineNewLanguages) {
                const response = await axiosApi.post('/api/languages', language);
                set((state) => ({ languages: [...state.languages, response.data.data] }))
            }
            localStorage.setItem('newLanguages', JSON.stringify([]));
            return { success: true, message: 'Offline languages added successfully' };
        } catch (error) {
            return { success: false, message: `Connection to database lost, impossible to add a new language:\n ${error.message}` };
        }
    },
    fetchLanguages: async () => {
        try {
            const response = await axiosApi.get('/api/languages');
            const sortedLanguages = response.data.data.sort((a, b) => a.name.localeCompare(b.name))
            set({ languages: sortedLanguages })

        } catch (error) {
            console.error(`Failed to fetch languages: ${error.message}`);
        }
    },
    updateLanguage: async (language) => {
        try {
            const response = await axiosApi.put(`/api/languages/${language._id}`, language);
            set((state) => ({
                languages: state.languages.map((l) => l._id === language._id ? response.data.data : l)
            }))
            return { success: true, message: 'Language updated successfully' };
        } catch (error) {
            return { success: false, message: `Connection to database lost, impossible to update language:\n ${error.message}` };
        }
    },
    fetchLanguageById: async (id) => {
        try {
            const response = await axiosApi.get('/api/languages');
            const language = response.data.data.find((l) => l._id === id)
            return { success: true, data: language }

        } catch (error) {
            return { success: false, message: `Impossible to fetch language:\n ${error.message}` };
        }
    },
}));
