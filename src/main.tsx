import { createRoot } from 'react-dom/client';
import './index.css';
import { StrictMode } from 'react';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { config } from './config/default';

const startApp = async () => {
    const root = createRoot(document.getElementById('root')!);
    root.render(
        <BrowserRouter>
            {/* <StrictMode> */}
            <App />
            {/* </StrictMode> */}
        </BrowserRouter>
    );
};

startApp();
