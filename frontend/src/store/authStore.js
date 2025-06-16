import { create } from "zustand";
import { authApiSlice } from "../features/auth/authApiSlice";

export const useAuthStore = create((set) => ({

    isAuthenticated: false,
    error: null,
    login: async ( username , password ) => {
        try {
            const response = await authApiSlice.useLoginEndpoint(username, password);
            console.log("Login response:", typeof response); // Debugging log
            console.log("Login response:", response); // Debugging log
            if(response.status===200){
                console.log("Login successful");
                set({ isAuthenticated: true, error: null });
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },

    logout: async () => {
        try {
            const response = await authApiSlice.useLogoutEndpoint();
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
            const response = await authApiSlice.useRefreshEndpoint();
            if(response.status===200){
                console.log("refreshing successful");
                set({ isAuthenticated: true, error: null });
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },
    

}));


