import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {ChakraProvider} from '@chakra-ui/react'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter was removed from here as it's now inside App.jsx */}
    <ChakraProvider> {/* ChakraProvider at the outermost for UI context */}
      <AuthProvider> {/* AuthProvider wraps App to provide auth context */}
        <App />
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>,
)
