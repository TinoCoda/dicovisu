import { create } from "zustand";
import { baseStore } from "./global";
import{useLoginEndpoint,useLogoutEndpoint,useRefreshEndpoint} from "../features/auth/authApi";

export const useAuthStore = create((set) => ({

    isAuthenticated: false,
    error: null,
    token: null,
    user:undefined, // Initialize user as undefined
    roles: [], // Store user roles
 
    login: async ( username , password ) => {
        try {
            const response = await useLoginEndpoint(username, password);
            if(response.status===200){
                set({
                    isAuthenticated: true,
                    error: null,
                    user: response.data.username,
                    token: response.data.accessToken,
                    roles: response.data.roles || [],
                });
                baseStore.getState().setToken(response.data.accessToken); // Update the global store
            }

            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
             throw error; // Re-throw the error for handling in components
        }
    },

    logout: async () => {
        try {
            const response = await useLogoutEndpoint();
            if(response.status===200){
                set({ isAuthenticated: false, error: null,user:null ,token:null, roles: [] });
            }

            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
        }
    },

    refresh: async () => {
        const setAccessToken = baseStore.getState().setToken; // Get the setAccessToken function from global store

        try {
            const { accessToken, username, roles } = await useRefreshEndpoint();
            set({
                isAuthenticated: true,
                error: null,
                token: accessToken,
                user: username,
                roles: roles || [],
            });
            setAccessToken(accessToken); // Update the global store
        } catch (error) {
            // No valid session to restore — this is the expected outcome for a
            // signed-out visitor, not a failure worth surfacing as an error.
            set({ isAuthenticated: false });
        }
    },
    

}));


