import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

import App from './App.jsx'
import theme from './theme.js'
import { BrowserRouter } from 'react-router-dom'
import '../index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
      <ChakraProvider theme={theme}>
          <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)
