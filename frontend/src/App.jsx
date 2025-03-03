import { useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'

import HomePage from './pages/HomePage'
import SearchBar from './components/SearchBar'



function App() {

  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // Call your API or filter logic here
  };


  return (
    <>
    <Box p={8}>

      <VStack>
        <HomePage/>
        <SearchBar onSearch={handleSearch} />

      </VStack>


    </Box>

    
    </>
  )
}

export default App
