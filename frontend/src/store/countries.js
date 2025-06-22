import { create } from "zustand";
import { SERVER_API_URL } from '../api/config/serverUrl';
import axiosApi from "../features/auth/api";

export const useCountryStore = create((set) => ({
    countries: [],
    setCountries: (countries) => set({ countries }),
    fetchCountries: async () => {
        try {
            const response = await axiosApi.get('/countries');
            /*if (!response) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }*/
            const data = await response;
            set({ countries: data.data });
        } catch (error) {
            console.error(`Error fetching countries: ${error.message}`);
        }
    },
    addCountry: async (country) => {
        try {
            if (!country.name || !country.code) {
                return { success: false, message: "Please fill all required fields" };
            }
            const response = await fetch(`${SERVER_API_URL}/api/countries`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(country)
            });
            const data = await response.json();
            set((state) => ({ countries: [...state.countries, data.data] }));
            return { success: true, message: 'Country added successfully' };
        } catch (error) {
            console.error(`Error adding country: ${error.message}`);
            return { success: false, message: `Failed to add country: ${error.message}` };
        }
    }
}));