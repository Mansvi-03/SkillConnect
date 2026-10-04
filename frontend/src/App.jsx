import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

/* =====================================================
   COMMON COMPONENTS
===================================================== */

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* =====================================================
   PUBLIC PAGES
===================================================== */

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* =====================================================
   CUSTOMER PAGES
===================================================== */

import Services from "./pages/customer/Services";
import ServiceDetails from "./pages/customer/ServiceDetails";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookService from "./pages/customer/BookService";
import MyBookings from "./pages/customer/MyBookings";
import BookingTracking from "./pages/customer/BookingTracking";
import Payments from "./pages/customer/Payments";
import Reviews from "./pages/customer/Reviews";
import Notifications from "./pages/customer/Notifications";
import CustomerChat from "./pages/customer/Chat";

/* =====================================================
   PROVIDER PAGES
===================================================== */

import ProviderDashboard from "./pages/provider/ProviderDashboard";
import MyServices from "./pages/provider/MyServices";
import AddService from "./pages/provider/AddService";
import EditService from "./pages/provider/EditService";
import Availability from "./pages/provider/Availability";
import ProviderBookings from "./pages/provider/ProviderBookings";
import Earnings from "./pages/provider/Earnings";
import ProviderChat from "./pages/provider/Chat";

/* =====================================================
   ADMIN PAGES
===================================================== */

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageServices from "./pages/admin/ManageServices";

/* =====================================================
   PROFILE
===================================================== */

import Profile from "./pages/Profile";

import Loading from "./components/Loading";

/* =====================================================
   PROTECTED ROUTE
===================================================== */

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authorization..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }

    if (user.role === "provider") {
      return <Navigate to="/provider/dashboard" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/* =====================================================
   APP
===================================================== */

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-grow">
        <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* =================================================
            PUBLIC SERVICES
        ================================================= */}

        <Route path="/services" element={<Services />} />

        <Route path="/services/:id" element={<ServiceDetails />} />

        {/* =================================================
            CUSTOMER ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />

          <Route path="/customer/bookings" element={<MyBookings />} />

          <Route
            path="/customer/bookings/:bookingId"
            element={<BookingTracking />}
          />

          <Route
            path="/customer/book-service/:serviceId"
            element={<BookService />}
          />

          <Route path="/customer/payments" element={<Payments />} />

          <Route path="/customer/reviews/:bookingId" element={<Reviews />} />

          <Route path="/customer/notifications" element={<Notifications />} />

          {/* BOOKING BASED CUSTOMER CHAT */}

          <Route path="/customer/chat/:bookingId" element={<CustomerChat />} />
        </Route>

        {/* =================================================
            PROVIDER ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute allowedRoles={["provider"]} />}>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />

          <Route path="/provider/services" element={<MyServices />} />

          <Route path="/provider/services/add" element={<AddService />} />

          <Route path="/provider/services/edit/:id" element={<EditService />} />

          <Route
            path="/provider/services/:serviceId/availability"
            element={<Availability />}
          />

          <Route path="/provider/bookings" element={<ProviderBookings />} />

          <Route path="/provider/earnings" element={<Earnings />} />

          {/* BOOKING BASED PROVIDER CHAT */}

          <Route path="/provider/chat/:bookingId" element={<ProviderChat />} />
        </Route>

        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/users" element={<ManageUsers />} />

          <Route path="/admin/categories" element={<ManageCategories />} />

          <Route path="/admin/services" element={<ManageServices />} />
        </Route>

        {/* =================================================
            COMMON PROFILE
        ================================================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["customer", "provider", "admin"]} />
          }
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
