import { create } from "zustand";
import { SERVER_API_URL } from '../api/config/serverUrl';
import axiosApi from "../features/auth/interceptor";
import { useAddCountryEndpoint, useFetchCountriesEndpoint } from "../api/countries/countryApi";

export const useCountryStore = create((set) => ({
    countries: [],
    setCountries: (countries) => set({ countries }),
    fetchCountries: async () => {
        try {
            const response = await useFetchCountriesEndpoint(); 
           
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
            const response = await useAddCountryEndpoint(country); /*await fetch(`${SERVER_API_URL}/api/countries`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(country)
            });*/
            const data = await response.json();
            set((state) => ({ countries: [...state.countries, data.data] }));
            return { success: true, message: 'Country added successfully' };
        } catch (error) {
            console.error(`Error adding country: ${error.message}`);
            return { success: false, message: `Failed to add country: ${error.message}` };
        }
    }
}));