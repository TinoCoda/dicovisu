
import {create} from 'zustand'
import {    useAddWordEndpoint,
            useFetchWordsEndpoint, 
            useDeleteWordEndpoint,
            useUpdateWordEndpoint, 
            useSearchWordEndpoint 
        } from '../api/words/wordApi';


export const useWordStore =create((set) => ({
    words: [],
    setWords: (words) => set({words}),
    addWord: async (word) => {
        try{
            if(!word.word || !word.meaning || !word.language){
                return ({ succes:false,message: "Please fill all required fields" });
            }
            const response = await useAddWordEndpoint(word);

            console.log("addWord response data: ", typeof response); // Debugging log
            const data = await response;
            set((state) => ({words: [...state.words, data.data]}))
            return {success:true,message:'Word added successfully'};

        }catch(error){
            var offlineNewWords=JSON.parse(localStorage.getItem('newWords')) ||[];
            const offlineNewWordsSet=new Set(offlineNewWords.map((w)=>w.word));
            offlineNewWordsSet.add(word);
            offlineNewWords=[...offlineNewWordsSet].map((w)=>({
                                                                word:w.word,
                                                                meaning:w.meaning,
                                                                language:w.language,
                                                                description:w.description,
                                                                example:w.example
                                                            }));
           
            localStorage.setItem('newWords',JSON.stringify(offlineNewWords));

            console.log(`connection to database lost, impossible to add a new word:\n ${error.message}`);
            return ({succes:false, message:`connection to database lost, impossible to add a new word:\n ${error.message}`});

        }

    },
    addOfflineWords: async () => {
        const offlineNewWords=JSON.parse(localStorage.getItem('newWords')) ||[];
        try{
            if(offlineNewWords.length===0) return;
            for(const word of offlineNewWords){
                const response = await fetch("/api/words", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(word)
                })
                const data = await response.json()
                set((state) => ({words: [...state.words, data.data]}))
    
            }
            localStorage.setItem('newWords',JSON.stringify([]));
            return {success:true,message:'Offline words added successfully'};

        }catch(e){
            console.log(`Run into an error: ${e.message}`);
            localStorage.setItem('newWords',JSON.stringify([]));
            return {success:false,message:e.message};

        }

    },
    fetchWords: async () => {
        try{
            const response = await useFetchWordsEndpoint();
            const data = await response
            console.log("fetchWords response data: ", typeof data);
            console.log(data);
            // can you sort data.data alphabetically here?
            // Sort data.data alphabetically by the 'word' property
            const pData = data.data.sort((a, b) => a.word.localeCompare(b.word));
            localStorage.setItem('words',JSON.stringify(pData));
    
            set({words: pData})
            
            console.log("fetchWords called");
            console.log(data.data);
           


        }catch(e){
            console.log(`Run into an error: ${e.message}\n${e.stack}`);
            const localWords=JSON.parse(localStorage.getItem('words')) ||[];
            set({words:localWords});

        }

    },
    deleteWord: async (wid) =>{
        const response = await useDeleteWordEndpoint(wid);
        
        /*fetch(`/api/words/${wid}`,
             {method: 'DELETE'

             })*/

        const data = await response
        console.log("deleteWord response data: ", typeof data); // Debugging log
        console.log("deleteWord response data: ", data); // Debugging log

        if(!data.success){
            
            return {success:false,message:data.message};
        }

        set((state) => ({words: state.words.filter((w) => w ._id!== wid)}))
    } ,
    updateWord: async (wid, updatedWord) => {
        const response = await useUpdateWordEndpoint(wid, updatedWord);
        console.log("updateWord response data: ", typeof response); // Debugging log
        console.log("updateWord response data: ", response); // Debugging log
        
        /*fetch(`/api/words/${wid}`,
        { method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedWord)
        });*/

        const data = response;//.json();
        console.log(data);
        if(!data.success) return {success:false,message:data.message};


        set((state) => ({words: state.words.map((w) => (w._id === wid ? data.data : w))}))
        return {success:true,message:'Word updated successfully',data:data.data};
    },

    searchWord: async (query,selectedLanguage) => {
        try{
            console.log("selected language in wordsStore:", selectedLanguage);
            const response = await useSearchWordEndpoint(query,selectedLanguage);
            
            const data = await response; //.json();
            console.log("data from searchWord");
            console.log(data.success);
            console.log(data);
            if(!data.success) return {success:false,message:data.message};
            const sortedData = data.data.sort((a, b) => a.word.localeCompare(b.word));
    
            set({words: sortedData});
            //console.log(words);
            return {success:true,message:'Word found',data:data.data};

        }catch(error){
            const regexQuery=`^${query}`
            const localWords=JSON.parse(localStorage.getItem('words')) ||[];
            const filteredWords=localWords.filter((w)=>w.word.match(new RegExp(regexQuery,'i')));
            
            set({words:filteredWords});
            console.log(`connection to database is lost: ${error.message}`);
            console.log(query);

        }

    },
    selectedWord: JSON.parse(localStorage.getItem('selectedWord')) || null,
    setSelectedWord: (selectedWord) => {
        localStorage.setItem('selectedWord', JSON.stringify(selectedWord))
        set({selectedWord})
    },

    wrappedWords: JSON.parse(localStorage.getItem('wrappedWords')) || [],
    setWrappedWords: (wrappedWords) => {
        localStorage.setItem('wrappedWords', JSON.stringify(wrappedWords))
        set({wrappedWords})
    },
    wrappedSearchResults: JSON.parse(localStorage.getItem('wrappedSearchResults')) || [],
    setWrappedSearchResults: (wrappedSearchResults) => {
        localStorage.setItem('wrappedSearchResults', JSON.stringify(wrappedSearchResults))
        set({wrappedSearchResults})
    },


}));