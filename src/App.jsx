import TopBar from './components/TopNav/TopBar'
import ProductsList from './components/Main Content/ProductsList'
import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import About from "./components/mainNav/About";
import Faq from "./components/mainNav/Faq";
import BestSellers from "./components/mainNav/BestSellers";
import Careers from "./components/mainNav/Careers";
import Coupons from "./components/mainNav/Coupons";
import Guides from "./components/mainNav/Guides";
import MainNav from "./components/mainNav/MainNav";
import AccountDashboard from './components/account/Dashboard';
import Support from './components/mainNav/Support';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import ForgotPassword from './components/authentication/ForgotPassword';
import ResetPassword from './components/authentication/ResetPassword';
import Orders from './components/account/Orders';
import Downloads from './components/account/Downloads';
import Addresses from './components/account/Addresses';
import Favorites from './components/account/Favorites';
import Profile from './components/account/Profile';

function App() {
  return (
    <>
      <TopBar></TopBar>
      <MainNav/>
      <Routes >

        <Route path="/products" element={<ProductsList />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/bestSellers" element={<BestSellers />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/support" element={<Support />} />
        <Route path="/account" element={<AccountDashboard />} />
        <Route path="/account/orders" element={<Orders />} />
        <Route path="/account/downloads" element={<Downloads />} />
        <Route path="/account/addresses" element={<Addresses />} />
        <Route path="/account/favorites" element={<Favorites />} />
        <Route path="/account/profile" element={<Profile />} />
      </Routes>
    </>
  );
}
export default App
