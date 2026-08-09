import { useEffect, useState } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
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
import AddWordsByJson from './pages/AddWordsByJson'
import StatisticsPage from './pages/StatisticsPage'
import ManageUsers from './pages/ManageUsers'






function App() {

  const { isAuthenticated, user, refresh } = useAuthStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Try to restore a session from the httpOnly refresh cookie before deciding
  // whether to show the login screen — otherwise every page reload bounces an
  // already-logged-in user back to /login while a valid cookie sits unused.
  useEffect(() => {
    refresh().finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return (
      <Center minH="100vh" bg="bg-canvas">
        <Spinner color="blue.400" thickness="3px" />
      </Center>
    );
  }

  return (
    <>
     { isAuthenticated && user ? (
    <Box minH={"100vh"}>
      <Navbar/>
      <Box px={{ base: 4, md: 8 }} py={6}>
        <Routes>
          <Route path='/' element={<HomePage/>} /> {/* Home page route */}
          <Route path='/add' element={<AddNewEntry/>} />
          <Route path='/details' element={<DetailPage/>} />
          <Route path="/edit-word/:id" element={<EditWordPage />} />
          <Route path='/languages' element={<AddNewLANG/>} />
          <Route path='/bulk-import' element={<AddWordsByJson/>} />
          <Route path='/statistics' element={<StatisticsPage/>} />
          <Route path='/users' element={<ManageUsers/>} />
          <Route path='/logout' element={<LogoutPage/>} />
        </Routes>
      </Box>
    </Box>)
     : (
      <Box minH={"100vh"}>
          <LoginPage/>
      </Box>
    )}

    
    </>
  )
}

export default App;