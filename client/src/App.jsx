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
import CategorySidebarMenu from "./components/Categories/CategoryMenu.jsx";
import axios from "axios";
import SellerDashboard from './components/seller/SellerDashboard';
import MarketplaceInfo from './components/footer/support/MarketplaceInfo';
import RoleGate from './components/auth/RoleGate';
import MarketplaceApplications from './components/admin/MarketplaceApplications';
import StorefrontList from './components/storefront/StorefrontList';
import StorefrontProduct from './components/storefront/StorefrontProduct';
import AdminApplicationsPage from './components/admin/AdminApplicationsPage';
import SellerLayout from './components/seller/SellerLayout';
import StoreSettings from './components/seller/settings/StoreSettings';
import Products from './components/seller/Products';
import Reviews from './components/seller/Reviews';
import Reports from './components/seller/Reports';
import OrdersSeller from './components/seller/OrdersSeller';
import StorePage from './components/store/StorePage';
// import StoreProducts from './components/store/StoreProducts';
// import StoreAbout from './components/store/StoreAbout';
// import StoreReviews from './components/store/StoreReviews';
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/slices/userSlice";
import { loadCart } from "./redux/thunks/cartThunks.js";
import CartPage from "./components/TopNav/cart/CartPage.jsx"
import CartCheckout from "./components/TopNav/cart/CartCheckout.jsx";
import FavoritesList from "./components/TopNav/favorites/FavoritesList.jsx"
import CategoryManagementPage from "./components/Categories/CategoryManagementPage.jsx"
import CartLayout from "./components/TopNav/cart/CartLayout.jsx";
import OrderSuccessPage from "./components/TopNav/cart/OrderSuccessPage.jsx";
import PaymentPage from "./components/TopNav/cart/PaymentPage.jsx"
import ProductPage from './components/productPage/ProductPage.jsx';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("🤣")
    const checkLoggedInUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/entrance/me", {
          withCredentials: true,
        });
        console.log("🤣", res.data)
        dispatch(setUser(res.data.user));
      } catch (err) {
        dispatch(clearUser());
      }
    };

    checkLoggedInUser();
    console.log("🤣ff")

  }, []);
  const user = useSelector((state) => state.user?.user);
  useEffect(() => {
    if (user) {
      console.log("🔄 טוען עגלה ממונגו אחרי ריפרוש...");
      dispatch(loadCart());
    }
  }, [user, dispatch]);
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" toastOptions={{
        style: {
          marginTop: "70px", // מרווח כדי לא להיתקע מתחת ל־NavBar
        },
      }} reverseOrder={false} />

      <CategorySidebarMenu></CategorySidebarMenu>

      <TopBar />
      <MainNav />

      <main className="flex-grow">
        <Routes>
          <Route path="products" element={<ProductsList />} />
          <Route path="products/:storeSlug/:productSlug" element={<ProductPage/>} />
          <Route path="/favorites" element={<FavoritesList />} />
          <Route path="/categories/manage" element={<CategoryManagementPage />} />
          {/* Layout מיוחד לזרימת הקניות */}
          <Route element={<CartLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CartCheckout />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          </Route>
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
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path='/seller-dashboard' element={<SellerDashboard />} />


          <Route path="/marketplace" element={<MarketplaceInfo />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/warranty-policy" element={<WarrantyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="/" element={<StorefrontList />} />
          <Route path="/p/:idOrSlug" element={<StorefrontProduct />} />
          <Route
            path="/admin/marketplace/applications"
            element={
              <RoleGate allow={["admin"]} mode="route" redirectTo="/">
                <MarketplaceApplications />
              </RoleGate>
            }
          />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />

          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="settings" element={<StoreSettings />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<OrdersSeller />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="/store/:slug" element={<StorePage />}>
            {/* <Route index element={<StoreProducts />} /> */}
            {/* <Route path="about" element={<StoreAbout />} />
            <Route path="reviews" element={<StoreReviews />} /> */}
          </Route>

        </Routes>

      </main>

      <Footer />
    </div>
  );
}
export default App
