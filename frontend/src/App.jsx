import { useState } from 'react'
import { Box, useColorModeValue, VStack } from '@chakra-ui/react'
import {Route, Routes} from "react-router-dom"



import Navbar from './components/NavBar'


import HomePage from './pages/HomePage'
import AddNewEntry from './pages/AddNewEntry'





function App() {



  return (
    <>
    <Box bg={useColorModeValue("gray.200","gray.700")} p={8} h={"100vh"}>
      <Navbar/>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/add' element={<AddNewEntry/>} />
      </Routes>



    </Box>

    
    </>
  )
}

export default App
