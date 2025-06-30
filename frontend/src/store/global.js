// store.js
import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'

// 1. Vanilla store
export const baseStore = createStore(() => ({
  name: "Luti",
  setName: (newName) => {
    baseStore.setState({ name: newName })
  },
  token: null,
  setToken: (token) => {
    baseStore.setState({ token })
    localStorage.setItem('accessToken', token) // Store the token in local storage
  },
  isAuthenticated: false,
  setIsAuthenticated: (status) => {
    baseStore.setState({ isAuthenticated: status })
  },
  user: null,
  setUser: (user) => {
    baseStore.setState({ user })
  },
}))

// 2. Hook for React
export const useGlobalStore = (selector) => useStore(baseStore, selector)
