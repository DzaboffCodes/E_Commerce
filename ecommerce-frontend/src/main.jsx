// Strict mode helps catch common React issues in development
import { StrictMode } from 'react' 

// Create root attaches React to the root div in index.html which the browser read
import { createRoot } from 'react-dom/client'

// Browser Router enables URL based navigation (only updates certain parts of the page instead of the entire page)
import { BrowserRouter } from 'react-router-dom'

// Importating index.css here allows us to load the global sytles once at the app start up
import './index.css'

// Top Level UI Layer
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>,
)
