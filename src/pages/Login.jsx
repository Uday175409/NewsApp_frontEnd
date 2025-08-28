import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/slices/authSlice";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  Loader2,
  Newspaper
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import "../components/css/AuthForms.css";

const Login = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  // Check if user was redirected here due to unauthorized access
  const wasRedirected = location.state?.from;
  const sessionMessage = sessionStorage.getItem('authMessage');
  const redirectMessage = sessionMessage || (wasRedirected ? "Your session has expired. Please log in again." : null);
  
  // Clear the session message after reading it
  useEffect(() => {
    if (sessionMessage) {
      sessionStorage.removeItem('authMessage');
    }
  }, [sessionMessage]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Clear general error
    if (error) setError("");
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }));

      if (loginUser.fulfilled.match(result)) {
        // Login successful, fetch bookmarks and likes
        import('../store/slices/newsSlice').then(({ fetchBookmarks, fetchLikes, clearBookmarks, clearLikes }) => {
          // Clear existing bookmarks and likes first
          dispatch(clearBookmarks());
          dispatch(clearLikes());
          
          // Then fetch user's bookmarks and likes
          dispatch(fetchBookmarks());
          dispatch(fetchLikes());
          
          // Navigate to intended page or profile
          const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
          const redirectTo = sessionRedirect || location.state?.from?.pathname || "/profile";
          
          // Clear the session redirect after using it
          if (sessionRedirect) {
            sessionStorage.removeItem('redirectAfterLogin');
          }
          
          navigate(redirectTo, { replace: true });
        });
      } else {
        // Handle login error - error is already set in Redux state
        console.error("Login failed:", result.payload);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: "demo@example.com",
      password: "demo123"
    });
  };

  return (
    <div className={`auth-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Newspaper className="h-8 w-8" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to continue reading the latest news
          </p>
          
          {/* Redirect Message */}
          {redirectMessage && (
            <div className="alert alert-warning d-flex align-items-center mt-3 mb-0" role="alert">
              <AlertCircle className="h-5 w-5 me-2" />
              <span>{redirectMessage}</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Global Error */}
          {error && (
            <div className="error-container">
              <div className="error-message">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="field-wrapper">
              <Mail className="field-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="field-wrapper">
              <Lock className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${fieldErrors.password ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="field-icon-right"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{fieldErrors.password}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                disabled={loading}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="auth-link"
              style={{ fontSize: '0.875rem' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: '3rem', marginBottom: '1rem' }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-secondary"
            style={{ width: '100%', height: '2.5rem' }}
          >
            <span>Try Demo Account</span>
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" className="auth-link" style={{ fontSize: '1rem', fontWeight: '600' }}>
            Create a new account
          </Link>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>By signing in, you agree to our</p>
          <div style={{ marginTop: '0.25rem' }}>
            <Link to="/terms" className="auth-link">Terms of Service</Link>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            <Link to="/privacy" className="auth-link">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
