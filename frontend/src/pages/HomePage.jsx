import React, { useEffect } from 'react'
import { useState } from 'react';
import { VStack } from '@chakra-ui/react';

import { useWordStore } from '../store/words';

import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';




const HomePage = () => {
    console.log("load HomePage");
    const { fetchWords, words } = useWordStore();
    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    


    const handleSearch = (query) => {
        console.log("Searching for:", query);
        // Call your API or filter logic here
        const { searchWord,words } = useWordStore();
       useEffect(() => {
        searchWord(query);
      }, [searchWord]);
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