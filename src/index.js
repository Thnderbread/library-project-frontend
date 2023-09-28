import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlacklistedBooksProvider } from './context/BlacklistedBooksContextProvider';
import { UserBooksProvider } from './context/UserBooksContextProvider'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <BlacklistedBooksProvider>
        <UserBooksProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </UserBooksProvider>
      </BlacklistedBooksProvider>
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);