import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import './index.css';
import './config/axios.config.js'; // ⬅️ הגדרות axios גלובליות
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from "./redux/store";
import AuthInit from './components/AuthInit'; // ⬅️ נשתמש בזה כדי למשוך את המשתמש משרת
import { GoogleOAuthProvider } from '@react-oauth/google'; // ⬅️ הוסיפי את זה
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="125595411902-vojgitn2ukbls8smkood1669gvob9rjh.apps.googleusercontent.com">
      <Provider store={store}>
        <BrowserRouter>
          {/* <Toaster position="top-center" toastOptions={{ duration: 3000 }} /> */}
          <ToastContainer position="top-center" rtl />

          <AuthInit /> {/* ⬅️ מריץ בדיקת התחברות ראשונית */}
          
          <App />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);