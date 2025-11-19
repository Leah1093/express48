import TopBar from "./components/TopNav/TopBar";
import { useGetCurrentUserQuery } from "./redux/services/authApi";
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import About from "./components/mainNav/About";
import Faq from "./components/mainNav/Faq";
import BestSellers from "./components/mainNav/BestSellers";
import Careers from "./components/mainNav/Careers";
import Coupons from "./components/mainNav/Coupons";
import Guides from "./components/mainNav/Guides";
import AccountDashboard from "./components/account/Dashboard";
import Support from "./components/mainNav/Support";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import ForgotPassword from "./components/authentication/ForgotPassword";
import ResetPassword from "./components/authentication/ResetPassword";
import Orders from "./components/account/Orders";
import { Toaster } from "react-hot-toast";
import Downloads from "./components/account/Downloads";
import Addresses from "./components/account/Addresses";
import Favorites from "./components/account/Favorites";
import Profile from "./components/account/Profile";
import TermsOfUse from "./components/footer/info/TermsOfUse";
import CancellationPolicy from "./components/footer/info/CancellationPolicy";
import PrivacyPolicy from "./components/footer/info/PrivacyPolicy";
import WarrantyPolicy from "./components/footer/info/WarrantyPolicy";
import ShippingPolicy from "./components/footer/info/ShippingPolicy";
import ReturnsPolicy from "./components/footer/info/ReturnsPolicy";
import SellerDashboard from "./components/seller/SellerDashboard";
import MarketplaceInfo from "./components/footer/support/MarketplaceInfo";
import RoleGate from "./components/auth/RoleGate";
import MarketplaceApplications from "./components/admin/MarketplaceApplications";
import StorefrontList from "./components/storefront/StorefrontList";
import StorefrontProduct from "./components/storefront/StorefrontProduct";
import AdminApplicationsPage from "./components/admin/AdminApplicationsPage";
import SellerLayout from "./components/seller/SellerLayout";
import StoreSettings from "./components/seller/settings/StoreSettings";
import Products from "./components/seller/Products";
import Reviews from "./components/seller/Reviews";
import Reports from "./components/seller/Reports";
import OrdersSeller from "./components/seller/OrdersSeller";
import StorePage from "./components/store/StorePage";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/slices/userSlice";
import { setIsMobile } from "./redux/slices/uiSlice";
import { loadCart } from "./redux/thunks/cartThunks.js";
import CartPage from "./components/TopNav/cart/CartPage.jsx";
import CartCheckout from "./components/TopNav/cart/CartCheckout.jsx";
import FavoritesList from "./components/TopNav/favorites/FavoritesList.jsx";
import CategoryManagementPage from "./components/Categories/CategoryManagementPage.jsx";
import CartLayout from "./components/TopNav/cart/CartLayout.jsx";
import OrderSuccessPage from "./components/TopNav/cart/OrderSuccessPage.jsx";
import PaymentPage from "./components/TopNav/cart/PaymentPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import CouponForm from "./components/seller/Coupons.jsx";
import ProductPage from "./components/Main Content/product/productPage/ProductPage.jsx";
import ProductsList from "./components/Main Content/product/ProductsList.jsx";
import HomeNewProducts from "./components/Main Content/home/HomeNewProducts.jsx";
import AuthHeader from "./components/authentication/AuthHeader.jsx";
import ProductForm from "./components/seller/products/forms/ProductForm.jsx";
import SellerProductsPage from "./components/seller/SellerProductsPage.jsx";
import ProductDetailPage from "./components/seller/ProductDetailPage.jsx";
import ProductCreate from "./components/seller/products/ProductCreate.jsx";
import ProductEdit from "./components/seller/products/ProductEdit.jsx";
import SearchResultsPage from "./components/Main Content/product/SearchResultsPage.jsx";
import ProductsPage from "./components/Main Content/product/ProductsPage.jsx";
import CheckoutSuccess from "./components/checkouts/CheckoutSuccess.jsx";
import CheckoutFaild from "./components/checkouts/CheckoutFailed.jsx";
import Footer from "./components/footer/Footer.jsx";
import { CategoriesBar } from "./components/Categories";
import ProductsByCategoryPage from "./components/Main Content/product/ProductsByCategoryPage.jsx";
import AccountLayout from "./components/account/AccountLayout.jsx";
import Payments from "./components/account/Payments.jsx";
import PolicySecurity from "./components/account/PolicySecurity.jsx";
import CustomerService from "./components/account/CustomerService.jsx";
import ManageRootCategories from "./components/Categories/ManageRootCategories.jsx";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useSelector((state) => state.ui.isMobile);
  const hideMainHeader =
    ["/login", "/register", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");
  const user = useSelector((state) => state.user?.user);
  const {
    data: currentUser,
    isSuccess,
    isError,
  } = useGetCurrentUserQuery(undefined, {
    skip: !!user,
  });

  useEffect(() => {
    console.log("API_URL =", import.meta.env.VITE_API_URL);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth <= 768));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      if (isSuccess && currentUser) {
        dispatch(setUser(currentUser));
      } else if (isError) {
        dispatch(clearUser());
      }
    }
  }, [isSuccess, isError, currentUser, user, dispatch]);

  useEffect(() => {
    if (user) {
      console.log("🔄 טוען עגלה ממונגו אחרי ריפרוש...");
      dispatch(loadCart());
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen flex flex-col font-[Rubik]">
      <Toaster
        position="top-center"
        toastOptions={{ style: { marginTop: "70px" } }}
        reverseOrder={false}
      />
      {!hideMainHeader && <TopBar />}
      {!hideMainHeader && <CategoriesBar />}
      <main className="flex-grow">
        <Routes>
          {/* חיפוש/חנות */}
          <Route path="/" element={<ProductsPage />} />
          <Route path="products" element={<ProductsPage />} />
          {/* עמוד מוצר לפי קטגוריה+סלאג */}

          <Route
            path="/products/by-category/*"
            element={<ProductsByCategoryPage />}
          />
          <Route
            path="products/:storeSlug/:productSlug"
            element={<ProductPage />}
          />

          {/* עמוד מוצר לפי מזהה/סלאג קצר (דף בית / חיפוש מהיר) */}
          <Route path="/p/:idOrSlug" element={<StorefrontProduct />} />

          <Route path="/favorites" element={<FavoritesList />} />
          <Route
            path="/categories/manage"
            element={<CategoryManagementPage />}
          />

          <Route path="/categories/ManagmentCategory" element={<ManageRootCategories />} />


          {/* זרימת קנייה */}
          <Route element={<CartLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CartCheckout />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order/success/:id" element={<OrderSuccessPage />} />
          </Route>

          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/failed" element={<CheckoutFaild />} />

          {/* סטטי/מידע */}
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/bestSellers" element={<BestSellers />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/support" element={<Support />} />
          <Route path="/marketplace" element={<MarketplaceInfo />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/warranty-policy" element={<WarrantyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />

          {/* חשבון/אימות */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/account" element={<AccountLayout />}>
            {/* ברירת מחדל – הפרופיל שלי */}
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="payments" element={<Payments />} />
            <Route path="customerService" element={<CustomerService />} />
            <Route path="policy-security" element={<PolicySecurity />} />

            {/* אם תרצי עמוד נפרד לדאשבורד: */}
            {/* <Route path="dashboard" element={<Dashboard />} /> */}
            {/* אם תרצי עמוד לוגאאוט נפרד: */}
            {/* <Route path="logout" element={<Logout />} /> */}
          </Route>

          {/* מוכר/אדמין */}
          <Route
            path="/admin/marketplace/applications"
            element={
              <RoleGate allow={["admin"]} mode="route" redirectTo="/">
                <MarketplaceApplications />
              </RoleGate>
            }
          />
          <Route
            path="/admin/applications"
            element={<AdminApplicationsPage />}
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute allow={["seller", "admin"]}>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboard />} />
            <Route path="settings" element={<StoreSettings />} />
            <Route path="products">
              <Route index element={<SellerProductsPage />} />
              <Route path="new" element={<ProductCreate />} />
              <Route path=":id/edit" element={<ProductEdit />} />
              <Route path=":id" element={<ProductDetailPage />} />
            </Route>
            <Route path="orders" element={<OrdersSeller />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="coupons" element={<CouponForm />} />
          </Route>

          {/* חנות ספציפית */}
          <Route path="/store/:slug" element={<StorePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
export default App;
