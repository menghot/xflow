import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './query.css'
import App from './App.tsx'
// Some api may trigger twice if  strict mode enabled
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
