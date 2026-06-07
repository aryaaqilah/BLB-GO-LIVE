import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Outlet } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar/NavBar";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import ShopLanding from "./pages/ShopLanding/ShopLanding";
import About from "./pages/About/About";
import Help from "./pages/Help/Help";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ARViewer from "./pages/ARViewer";
import Address from "./pages/Address/Address";
import Confirmation from "./pages/Confirmation/Confirmation";
import Payment from "./pages/Payment/Payment";
import Customizer from "./pages/Customizer/Customizer";
import Profile from "./pages/Profile/Profile";
import OrderDetail from "./pages/Order Detail/OrderDetail";
import FloristDashboard from "./pages/FloristDashboard/FloristDashboard";
import FloristProduct from "./pages/FloristProduct/FloristProduct";
import FloristOrder from "./pages/FloristOrder/FloristOrder";
import FloristManageBouquet from "./pages/FloristManageBouquet/FloristManageBouquet"; 
import FloristManageItem from "./pages/FloristManageItem/FloristManageItem";
import FloristManageOrder from "./pages/FloristManageOrder/FloristManageOrder";
import FloristCustomization from "./pages/FloristCustomization/FloristCustomization";

import AdminCustomerList from "./pages/AdminCustomerList/AdminCustomerList";
import AdminManageCustomer from "./pages/AdminManageCustomer/AdminManageCustomer";
import AdminFloristList from "./pages/AdminFloristList/AdminFloristList";
import AdminManageFlorist from "./pages/AdminManageFlorist/AdminManageFlorist";
import AdminOrderList from "./pages/AdminOrderList/AdminOrderList";
import AdminManageOrder from "./pages/AdminManageOrder/AdminManageOrder";
import AdminChangeLog from "./pages/AdminChangeLog/AdminChangeLog";

import IdleTimer from "./components/IdleTimer";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { LoadingProvider } from './contexts/LoadingContext';
import "./App.css"

const NotFound = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBackAndLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "100px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 className="h1 txt-color-primary">404</h1>
      <h2 className="h2">Halaman Tidak Ditemukan</h2>
      <p className="p1" style={{ margin: "20px 0" }}>Maaf, halaman yang Anda cari tidak ada atau Anda tidak memiliki akses.</p>
      <a href="/" onClick={handleBackAndLogout} className="txt-color-primary weight-bold" style={{ cursor: 'pointer', textDecoration: 'none' }}>Kembali ke Beranda</a>
    </div>
  );
};

const CustomerLayout = ({ isRestricted }) => {
  const location = useLocation();
  const hideNavbarFooter = ["/profile", "/order-detail", "/login", "/register","/customizer", "/ar", "/address", "/confirmation", "/payment", "/store"].some(path => 
    location.pathname.startsWith(path)
  );
  
  if (isRestricted) return <NotFound />;

  return (
    <div className="AppCustomerLayout">
      {!hideNavbarFooter && <Navbar />}
      <main><Outlet /></main>
      {!hideNavbarFooter && <Footer />}
    </div>
  );
};

const DashboardLayout = ({ isAllowed }) => {
  if (!isAllowed) return <NotFound />;

  return (
    <div className="AppFloristLayout">
      <Sidebar />
      <main className="MainFloristContent"><Outlet /></main>
    </div>
  );
};

function AppContent() {
  const auth = useAuth();
  const user = auth?.user; 
  
  const isFlorist = user?.userType === 'florist';
  const isAdmin = user?.userType === 'admin';
  const isRestricted = isFlorist || isAdmin;

  return (
    <>
      <IdleTimer timeout={300000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ar/:id" element={<ARViewer />} />

        <Route element={<CustomerLayout isRestricted={isRestricted} />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/store/:storeId" element={<ShopLanding />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/customizer" element={<Customizer />} />
          <Route path="/address" element={<Address />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order-detail/:orderId" element={<OrderDetail />} />
        </Route>

        <Route element={<DashboardLayout isAllowed={isFlorist} />}>
          <Route path="/dashboard" element={<FloristDashboard />} />
          <Route path="/inventory" element={<FloristProduct/>} />
          <Route path="/manage-orders" element={<FloristOrder />} />
          <Route path="/inventory/bouquet/add" element={<FloristManageBouquet />} />
          <Route path="/inventory/bouquet/edit/:id" element={<FloristManageBouquet />} />
          <Route path="/inventory/item/add" element={<FloristManageItem />} />
          <Route path="/inventory/item/edit/:id" element={<FloristManageItem />} />
          <Route path="/manage-orders/orders/edit/:id" element={<FloristManageOrder />} />
          <Route path="/customization" element={<FloristCustomization />} />
        </Route>

        <Route element={<DashboardLayout isAllowed={isAdmin} />}>
          <Route path="/admin/customers" element={<AdminCustomerList />} />
          <Route path="/admin/customers/add" element={<AdminManageCustomer />} />
          <Route path="/admin/customers/edit/:id" element={<AdminManageCustomer />} />
          <Route path="/admin/florists" element={<AdminFloristList />} />
          <Route path="/admin/florists/add" element={<AdminManageFlorist />} />
          <Route path="/admin/florists/edit/:id" element={<AdminManageFlorist />} />
          <Route path="/admin/orders" element={<AdminOrderList />} />
          <Route path="/admin/orders/edit/:id" element={<AdminManageOrder />} />
          <Route path="/admin/history" element={<AdminChangeLog />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AlertProvider> 
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </AlertProvider>
      </Router>
    </AuthProvider>
  );
}