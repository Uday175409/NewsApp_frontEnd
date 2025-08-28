// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/shared/Navbar";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import PublicRoute from "./components/shared/PublicRoute";
import AuthErrorHandler from "./components/shared/AuthErrorHandler";
import ArticleModal from "./components/shared/ArticleModalSimple";
import ToastContainer from "./components/shared/Toast";
import { closeArticleModal } from "./store/slices/uiSlice";
import useAuthRedirect from "./hooks/useAuthRedirect";
import useUserPreferences from "./hooks/useUserPreferences";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import News from "./pages/News";
import UpdateProfile from "./pages/UpdateProfile";
import Bookmarks from "./pages/Bookmarks";

import { Login as AdminLogin, Dashboard as AdminDashboard, Users as AdminUsers, Analytics as AdminAnalytics } from "./pages/admin";
import AdminProtectedRoute from "./components/shared/admin/AdminProtectedRoute";
import setupAxiosInterceptors from "./utils/axiosSetup";
import Featured from "./pages/Featured";
import "./components/css/ThemeFixes.css";
// Initialize axios interceptors
setupAxiosInterceptors();

function AppLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  
  const hideNavbar =
    location.pathname === "/login" || 
    location.pathname === "/register" ||
    location.pathname.startsWith("/admin");

  // Use the auth redirect hook
  // useAuthRedirect(); // TEMPORARILY DISABLED
  
  // Use the user preferences hook to fetch bookmarks and likes
  // useUserPreferences(); // TEMPORARILY DISABLED

  return (
    <AuthErrorHandler>
      {!hideNavbar && <Navbar />}
      <div className="container mt-4">
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path="/" element={<News />} />
          <Route path="/news" element={<News />} />

          <Route path="/featured" element={<Featured />} />

          {/* Auth routes - redirect if already logged in */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminProtectedRoute>
              <AdminAnalytics />
            </AdminProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/bookmarks" element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      
      {/* Global Article Modal - Available on all pages */}
      {modals.articleModal.isOpen && (
        <ArticleModal
          article={modals.articleModal.article}
          onClose={() => dispatch(closeArticleModal())}
        />
      )}
      
      {/* Global Toast Container */}
      <ToastContainer />
    </AuthErrorHandler>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}
