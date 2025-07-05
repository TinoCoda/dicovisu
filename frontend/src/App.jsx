import { Box, useColorModeValue, VStack } from '@chakra-ui/react'
import {Route, Routes} from "react-router-dom"
import { useAuthStore } from './store/authStore'

import Navbar from './components/NavBar'
import HomePage from './pages/HomePage'
import AddNewEntry from './pages/AddNewEntry'
import DetailPage from './pages/DetailPage'
import AddNewLANG from './pages/AddNewLANG'
import LoginPage from './pages/LoginPage'
import EditWordPage from './pages/EditWordPage'
import LogoutPage from './pages/LogoutPage'






function App() {

  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
     { isAuthenticated && user ? (
    <Box bg={useColorModeValue("gray.200","gray.700")} p={8} h={"100vh"}>
      <Navbar/>
      <Routes>
        <Route path='/' element={<HomePage/>} /> {/* Home page route */}
        <Route path='/add' element={<AddNewEntry/>} />
        <Route path='/details' element={<DetailPage/>} />
        <Route path="/edit-word/:id" element={<EditWordPage />} />
        <Route path='/languages' element={<AddNewLANG/>} />
        <Route path='/logout' element={<LogoutPage/>} />
        
      </Routes>
    </Box>)
     : (
      <Box bg={useColorModeValue("gray.200","gray.700")} p={0} h={"100vh"}>
          <LoginPage/>
      </Box>
    )}

    
    </>
  )
}

export default App;