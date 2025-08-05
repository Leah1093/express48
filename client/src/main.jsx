// import React from 'react'
// import { BrowserRouter } from "react-router-dom";
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { Toaster } from 'react-hot-toast';
// import { Provider } from 'react-redux';
// import {store} from "./redux/store.js";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Provider store={store}>
//     <BrowserRouter>
//       <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
//       <App />
//     </BrowserRouter>
//     </Provider>
//   </React.StrictMode>
// )

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from "./redux/store.js";
import AuthInit from './components/AuthInit'; // ⬅️ נשתמש בזה כדי למשוך את המשתמש משרת

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <AuthInit /> {/* ⬅️ מריץ בדיקת התחברות ראשונית */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
