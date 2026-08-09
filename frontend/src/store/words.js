
import {create} from 'zustand'
import {    useAddWordEndpoint,
            useFetchWordsEndpoint, 
            useDeleteWordEndpoint,
            useUpdateWordEndpoint, 
            useSearchWordEndpoint,
            useAddRelationshipEndpoint,
            useRemoveRelationshipEndpoint
        } from '../api/words/wordApi';


export const useWordStore =create((set) => ({
    words: [],
    setWords: (words) => set({words}),
    addWord: async (word) => {
        try{
            if(!word.word || !word.meaning || !word.language){
                return ({ success:false, message: "Please fill all required fields", word: null });
            }
            const response = await useAddWordEndpoint(word);
            const data = await response;

            set((state) => ({words: [...state.words, data.data]}))

            return {success:true, message:'Word added successfully', word: data.data};

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

            // Extract error message - handle 409 (conflict) specially
            let errorMessage = error.message;
            if (error.response?.status === 409) {
                errorMessage = 'Word already exists in database';
            } else if (error.message) {
                errorMessage = error.message.split(' url=')[0]; // Remove URL from error message
            }

            return {success:false, message: errorMessage, word: null};

        }

    },
    addOfflineWords: async () => {
        const offlineNewWords = JSON.parse(localStorage.getItem('newWords')) || [];

        if (offlineNewWords.length === 0) {
            return { success: true, message: 'No offline words to sync' };
        }

        const successfulWords = [];
        const failedWords = [];

        try {
            for (const word of offlineNewWords) {
                try {
                    // Use authenticated API endpoint instead of raw fetch
                    const response = await useAddWordEndpoint(word);

                    if (response.success && response.data) {
                        set((state) => ({ words: [...state.words, response.data] }));
                        successfulWords.push(word);
                    } else {
                        failedWords.push(word);
                        console.warn(`Failed to sync word: ${word.word}`);
                    }
                } catch (error) {
                    // If individual word fails, keep it in failed list
                    failedWords.push(word);
                    console.error(`Error syncing word "${word.word}":`, error.message);
                }
            }

            // Only remove successfully synced words from localStorage
            if (successfulWords.length > 0) {
                localStorage.setItem('newWords', JSON.stringify(failedWords));
            }

            return {
                success: failedWords.length === 0,
                message: failedWords.length === 0
                    ? `Successfully synced ${successfulWords.length} offline words`
                    : `Synced ${successfulWords.length} words, ${failedWords.length} failed`,
                synced: successfulWords.length,
                failed: failedWords.length
            };

        } catch (error) {
            console.error('Error in addOfflineWords:', error);
            return { success: false, message: error.message };
        }
    },
    fetchWords: async () => {
        try{
            const response = await useFetchWordsEndpoint();
            const data = await response
            // Sort data.data alphabetically by the 'word' property
            const pData = data.data.sort((a, b) => a.word.localeCompare(b.word));
            localStorage.setItem('words',JSON.stringify(pData));
    
            set((state) => {
                // Update selectedWord if it exists, to keep it in sync with fetched data
                const updatedSelectedWord = state.selectedWord 
                    ? pData.find(w => w._id === state.selectedWord._id) || state.selectedWord
                    : null;
                
                if (updatedSelectedWord && updatedSelectedWord !== state.selectedWord) {
                    localStorage.setItem('selectedWord', JSON.stringify(updatedSelectedWord));
                }
                
                return {
                    words: pData,
                    selectedWord: updatedSelectedWord
                };
            });

        }catch(e){
            console.error(`fetchWords failed, falling back to cached copy: ${e.message}`);
            const localWords=JSON.parse(localStorage.getItem('words')) ||[];
            set({words:localWords});

        }

    },
    deleteWord: async (wid) =>{
        const response = await useDeleteWordEndpoint(wid);
        const data = await response

        if(!data.success){
            return {success:false,message:data.message};
        }

        set((state) => ({words: state.words.filter((w) => w ._id!== wid)}))
    } ,
    updateWord: async (wid, updatedWord) => {
        const response = await useUpdateWordEndpoint(wid, updatedWord);
        const data = response;
        if(!data.success) return {success:false,message:data.message};


        set((state) => ({words: state.words.map((w) => (w._id === wid ? data.data : w))}))
        return {success:true,message:'Word updated successfully',data:data.data};
    },

    searchWord: async (terms, selectedLanguage) => {
        // terms: string (empty query) or string[] (lemma variants)
        const termList = Array.isArray(terms) ? terms : (terms ? [terms] : []);
        try {
            const data = await useSearchWordEndpoint(termList.length ? termList : ['']);
            if (!data.success) return { success: false, message: data.message };

            let directMatches = data.directMatches || [];
            let exampleMatches = data.exampleMatches || [];

            // Filter by language if selected
            if (selectedLanguage) {
                directMatches = directMatches.filter((w) => w.language.includes(selectedLanguage));
                exampleMatches = exampleMatches.filter((w) => w.language.includes(selectedLanguage));
            }

            return { success: true, message: 'Search complete', directMatches, exampleMatches, totalCount: data.totalCount };
        } catch (error) {
            // Offline fallback — use first term
            const fallbackTerm = termList[0] || '';
            const escaped = fallbackTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp('^' + escaped, 'i');
            const localWords = JSON.parse(localStorage.getItem('words')) || [];
            const directMatches = localWords.filter((w) => regex.test(w.word) || regex.test(w.meaning));
            const exampleMatches = localWords.filter((w) =>
                !directMatches.includes(w) && (regex.test(w.example) || regex.test(w.description))
            );
            console.error(`Offline search fallback: ${error.message}`);
            return { success: true, message: 'Offline results', directMatches, exampleMatches };
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

    // Add relationship between words
    addRelationship: async (wordId, relatedWordId, relationshipType) => {
        try {
            const response = await useAddRelationshipEndpoint(wordId, relatedWordId, relationshipType);
            
            if (!response.success) {
                return { success: false, message: response.message };
            }

            // Update both words in the store
            set((state) => ({
                words: state.words.map((w) => {
                    if (w._id === wordId) {
                        return response.data.word;
                    }
                    if (w._id === relatedWordId) {
                        return response.data.relatedWord;
                    }
                    return w;
                }),
                // Update selectedWord if it's one of the affected words
                selectedWord: state.selectedWord?._id === wordId 
                    ? response.data.word 
                    : state.selectedWord?._id === relatedWordId 
                        ? response.data.relatedWord 
                        : state.selectedWord
            }));

            return { success: true, message: 'Relationship added successfully' };
        } catch (error) {
            console.error('Error adding relationship:', error);
            return { success: false, message: error.message };
        }
    },

    // Remove relationship between words
    removeRelationship: async (wordId, relatedWordId) => {
        try {
            const response = await useRemoveRelationshipEndpoint(wordId, relatedWordId);
            
            if (!response.success) {
                return { success: false, message: response.message };
            }

            // Refresh words to get updated data
            const wordsResponse = await useFetchWordsEndpoint();
            const sortedWords = wordsResponse.data.sort((a, b) => a.word.localeCompare(b.word));
            
            set((state) => ({
                words: sortedWords,
                // Update selectedWord if it's one of the affected words
                selectedWord: state.selectedWord?._id === wordId || state.selectedWord?._id === relatedWordId
                    ? sortedWords.find(w => w._id === state.selectedWord._id)
                    : state.selectedWord
            }));

            return { success: true, message: 'Relationship removed successfully' };
        } catch (error) {
            console.error('Error removing relationship:', error);
            return { success: false, message: error.message };
        }
    },


}));