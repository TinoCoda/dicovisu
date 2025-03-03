import React from 'react'
import { VStack } from '@chakra-ui/react';

import SearchBar from '../components/SearchBar';


const HomePage = () => {
    console.log("load HomePage");
    const handleSearch = (query) => {
        console.log("Searching for:", query);
        // Call your API or filter logic here
      };
    
  return (
    <>

    <VStack>
    
    <SearchBar onSearch={handleSearch} />

    </VStack>
    </>

  )
}

export default HomePage