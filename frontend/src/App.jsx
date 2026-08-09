import { useEffect, useState, lazy, Suspense } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
import {Route, Routes} from "react-router-dom"
import { useAuthStore } from './store/authStore'

import Navbar from './components/NavBar'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import LoginPage from './pages/LoginPage'

// Everything below is reached by navigating from the home/search/detail
// pages, never needed for the initial paint — split into separate chunks
// so a plain learner never downloads the admin/CRUD bundles.
const AddNewEntry = lazy(() => import('./pages/AddNewEntry'))
const AddNewLANG = lazy(() => import('./pages/AddNewLANG'))
const EditWordPage = lazy(() => import('./pages/EditWordPage'))
const LogoutPage = lazy(() => import('./pages/LogoutPage'))
const AddWordsByJson = lazy(() => import('./pages/AddWordsByJson'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const ManageUsers = lazy(() => import('./pages/ManageUsers'))






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
        <Suspense fallback={
          <Center py={20}>
            <Spinner color="blue.400" thickness="3px" />
          </Center>
        }>
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
        </Suspense>
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