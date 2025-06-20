import { create } from 'zustand'
import { SERVER_API_URL } from '../api/config/serverUrl';

export const useLanguageStore = create((set) => ({
    languages: [],
    setLanguages: (languages) => set({ languages }),
    addLanguage: async (language) => {
        try {
            if (!language.name || !language.code) {
                return { success: false, message: "Please fill all required fields" };
            }
            const response = await fetch(`${SERVER_API_URL}/api/languages`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(language)
            })
            const data = await response.json()
            set((state) => ({ languages: [...state.languages, data.data] }))
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

            console.log(`connection to database lost, impossible to add a new language:\n ${error.message}`);
            return ({ success: false, message: `connection to database lost, impossible to add a new language:\n ${error.message}` });

        }

    },
    addOfflineLanguages: async () => {
        const offlineNewLanguages = JSON.parse(localStorage.getItem('newLanguages')) || [];
        try {
            if (offlineNewLanguages.length === 0) return;
            for (const language of offlineNewLanguages) {
                const response = await fetch("/api/languages", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(language)
                })
                const data = await response.json()
                set((state) => ({ languages: [...state.languages, data.data] }))
            }
            localStorage.setItem('newLanguages', JSON.stringify([]));
            return { success: true, message: 'Offline languages added successfully' };
        } catch (error) {
            console.log(`connection to database lost, impossible to add a new language:\n ${error.message}`);
            return { success: false, message: `connection to database lost, impossible to add a new language:\n ${error.message}` };
        }
    },
    fetchLanguages: async () => {
        try {
            const response = await fetch(`${SERVER_API_URL}/api/languages`)
            const data = await response.json()
            const sortedLanguages = data.data.sort((a, b) => a.name.localeCompare(b.name))
            set({ languages: sortedLanguages })
            
        } catch (error) {
            console.log(`connection to database lost, impossible to fetch languages:\n ${error.message}`);
        }
    },
    updateLanguage: async (language) => {
        try {
            const response = await fetch(`${SERVER_API_URL}/api/languages/${language._id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(language)
            })
            const data = await response.json()
            set((state) => ({
                languages: state.languages.map((l) => l._id === language._id ? data.data : l)
            }))
            return { success: true, message: 'Language updated successfully' };
        } catch (error) {
            console.log(`connection to database lost, impossible to update language:\n ${error.message}`);
            return { success: false, message: `connection to database lost, impossible to update language:\n ${error.message}` };
        }
    },
    fetchLanguageById: async (id) => {
        try {
            console.log(id);
            const response = await fetch(`${SERVER_API_URL}/api/languages`)
            const data = await response.json()
            const language = data.data.find((l) => l._id === id)
            console.log(language);
            return { success: true, data: language }
           
        } catch (error) {
            console.log(`Impossible to fetch language:\n ${error.message}`);
            return { success: false, message: `Impossible to fetch language:\n ${error.message}` };
        }
    },
}));