
import {create} from 'zustand'

export const useWordStore =create((set) => ({
    words: [],
    setWords: (words) => set({words}),
    addWord: async (word) => {
        if(!word.word || !word.meaning || !word.language){
            return ({ succes:false,message: "Please fill all required fields" });
        }
        const response = await fetch('/api/words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(word)
        })
        const data = await response.json()
        set((state) => ({words: [...state.words, data.data]}))
        return {success:true,message:'Word added successfully'};
    },
    fetchWords: async () => {
        const response = await fetch('/api/words')
        const data = await response.json()
        set({words: data.data})
        console.log("fetchWords called");
        console.log(data.data);
    },
    deleteWord: async (wid) =>{
        const response = await fetch(`/api/words/${wid}`,
             {method: 'DELETE'

             })
        const data = await response.json()

        if(!data.success){
            
            return {success:false,message:data.message};
        }


        set((state) => ({words: state.words.filter((w) => w ._id!== wid)}))
    } ,
    updateWord: async (wid, updatedWord) => {
        const response = await fetch(`/api/words/${wid}`,
        { method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedWord)
        });

        const data = await response.json();
        if(!data.success) return {success:false,message:data.message};

        set((state) => ({words: state.words.map((w) => (w._id === wid ? data.data : w))}))
    },

    searchWord: async (query) => {
        const response = await fetch(`/api/words/search?word=${query}`);
        console.log("searchWord called");

        const data = await response.json();
        console.log("data from searchWord");
        console.log(data.success);
        console.log(data);
        if(!data.success) return {success:false,message:data.message};
        set({words: data.data});
        //console.log(words);
        return {success:true,message:'Word found',data:data.data};
    },
    selectedWord: null,
    setSelectedWord: (selectedWord) => set({selectedWord})
}));