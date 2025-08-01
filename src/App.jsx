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
import { Toaster } from 'react-hot-toast';
import Downloads from './components/account/Downloads';
import Addresses from './components/account/Addresses';
import Favorites from './components/account/Favorites';
import Profile from './components/account/Profile';
import Footer from './components/footer/Footer';
import TermsOfUse from './components/footer/info/TermsOfUse';
import CancellationPolicy from './components/footer/info/CancellationPolicy';
import PrivacyPolicy from './components/footer/info/PrivacyPolicy';
import WarrantyPolicy from './components/footer/info/WarrantyPolicy';
import ShippingPolicy from './components/footer/info/ShippingPolicy';
import ReturnsPolicy from './components/footer/info/ReturnsPolicy';
import CategorySidebarMenu from "./components/CategoryMenu";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
       
      <CategorySidebarMenu></CategorySidebarMenu>

      <TopBar />
      <MainNav />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/products" element={<ProductsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />



          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/warranty-policy" element={<WarrantyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />


        </Routes>

      </main>

      <Footer />
    </div>
  );
}
export default App
