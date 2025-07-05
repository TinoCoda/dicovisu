import { create } from "zustand";
import {useGlobalStore} from "./global";
import { baseStore } from "./global";
import{useLoginEndpoint,useLogoutEndpoint,useRefreshEndpoint} from "../features/auth/authApi";

export const useAuthStore = create((set) => ({

    isAuthenticated: false,
    error: null,
    token: null,
    user:undefined, // Initialize user as undefined
 
    login: async ( username , password ) => {
        console.log("Attempting to log in with username/store:  ", username); // Debugging log
        console.log("Attempting to log in with password/store:  ",password);
        try {
            console.log("logging in... useAuthStore::::::::::::");
            const response = await useLoginEndpoint(username, password);
            console.log("Login response:", typeof response); // Debugging log
            const restrictedResponse = {
              username: response.data.username, 
              roles: response.data.roles, 
              message: response.data.message 
            };
            console.log("Login response:", restrictedResponse); // Debugging log
            if(response.status===200){
                console.log("Login successful");
           
                set({ isAuthenticated: true, error: null });
                set({ user: response.data.username }); // Store the user data in the state
                set({ token: response.data.accessToken }); // Store the token in the state
               baseStore.getState().setToken(response.data.accessToken); // Update the global store
                //accessToken=response.data.accessToken; // Update the global accessToken variable
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
        const setAccessToken = useGlobalStore.getState().setToken; // Get the setAccessToken function from global store
        
        try {
            const response = await useRefreshEndpoint();
            if(response.status===200){
                console.log("store::: refreshing successful");
                set({ isAuthenticated: true, error: null });
                set({ token: response.data.accessToken }); // Store the new token in the state
                //accessToken=response.data.accessToken; // Update the global accessToken variable
                setAccessToken(response.data.accessToken); // Update the global store
                localStorage.setItem('accessToken', response.data.accessToken); // Update local storage
            }else{
                console.log("store::: refreshing failed");
            }
            
            return response; // Return the response for further use if needed
        } catch (error) {
            set({ error: error.message });
            // throw error; // Re-throw the error for handling in components
        }
    },
    

}));


