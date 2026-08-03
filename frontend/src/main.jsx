import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <LoadingProvider>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>}>
            <App />
          </Suspense>
        </LoadingProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);