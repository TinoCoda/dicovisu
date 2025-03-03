import React, { useEffect } from 'react'
import { useState } from 'react';
import { VStack } from '@chakra-ui/react';

import { useWordStore } from '../store/words';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';




const HomePage = () => {
    console.log("load HomePage");
    const { fetchWords, words, searchWord } = useWordStore();
    const [searchResults, setSearchResults] = useState([]); 
    
    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    


    const handleSearch = async (query) => {
      console.log("Searching for:", query);
      const responseObject = await searchWord(query); 
      console.log("response:", responseObject);
      const result = responseObject.data;
      console.log("success:", responseObject.success);
      console.log("message:", responseObject.message);
      
      setSearchResults(result); 
  };

    const handleSelect= (word) => {
        console.log("Selected word:", word);
        // Call your API or filter logic here
      };
    
  return (
    <>

    <VStack>
    
    <SearchBar onSearch={handleSearch} />
    <SearchResult results={words} onSelect={handleSelect} />

    </VStack>
    </>

  )
}

export default HomePage