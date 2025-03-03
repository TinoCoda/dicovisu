import { get } from 'mongoose'
import {create} from 'zustand'

export const useWordStore =create((set) => ({
    words: [],
    setWords: (words) => set({words}),
    addWord: (word) => set((state) => ({words: [...state.words, word]})),
    getWords: () => get('/api/words').then((data) => set({words: data})),
    deleteWord: (word) => set((state) => ({words: state.words.filter((w) => w !== word)})),
    updateWord: (word) => set((state) => ({words: state.words.map((w) => (w === word ? word : w)})),
    searchWord: (query) => set((state) => ({words: state.words.filter((w) => w.includes(query)})),
}));