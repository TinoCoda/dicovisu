import { create } from "zustand";
import { accessToken } from "../features/auth/api";
import{useLoginEndpoint,useLogoutEndpoint,useRefreshEndpoint} from "../features/auth/authApi";

export const useAuthStore = create((set) => ({

    isAuthenticated: false,
    error: null,
    token: null,
    login: async ( username , password ) => {
        try {
            const response = await useLoginEndpoint(username, password);
            console.log("Login response:", typeof response); // Debugging log
            console.log("Login response:", response); // Debugging log
            if(response.status===200){
                console.log("Login successful");
                set({ isAuthenticated: true, error: null });
                set({ token: response.data.accessToken }); // Store the token in the state
                accessToken=response.data.accessToken; // Update the global accessToken variable
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },

    logout: async () => {
        try {
            const response = await useLogoutEndpoint();
            if(response.status===200){
                console.log("Logout successful");
                set({ isAuthenticated: false, error: null });
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },

    refresh: async () => {
        try {
            const response = await useRefreshEndpoint();
            if(response.status===200){
                console.log("store::: refreshing successful");
                set({ isAuthenticated: true, error: null });
                set({ token: response.data.accessToken }); // Store the new token in the state
                accessToken=response.data.accessToken; // Update the global accessToken variable
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },
    

}));


