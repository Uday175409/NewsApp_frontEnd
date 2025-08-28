import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  Shield,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import "../components/css/AuthForms.css";

const Register = () => {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    console.log("👉 Running validation for:", form);

    // Username validation
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter, uppercase letter, and number";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    console.log("👉 Validation Errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("✅ Submit pressed. Form:", form);

    if (!validateForm()) {
      console.log("❌ Validation failed. Aborting call.");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      console.log("🚀 Sending registration request...");

      const { confirmPassword, ...registrationData } = form;
      console.log("Data sent:", registrationData);

      const res = await axios.post(
        "http://localhost:4000/api/user/register",
        registrationData
      );
      console.log("✅ API response:", res.data);

      setSuccess(true);
      // Reset form fields after successful registration
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please log in with your credentials.",
          },
        });
      }, 2000);
    } catch (error) {
      console.error("❌ API error:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      console.log("🔁 Finished API call (success or error).");
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`✏️ Changing ${field}:`, value);
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const getPasswordStrength = () => {
    const password = form.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    if (score <= 2)
      return { strength: 33, label: "Weak", color: "bg-destructive" };
    if (score <= 3)
      return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className={`auth-container ${theme === "dark" ? "dark-theme" : ""}`}>
        <div className="success-container">
          <div className="success-icon">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Registration Successful!
          </h2>
          <p
            style={{ fontSize: "1.1rem", marginBottom: "2rem", opacity: "0.9" }}
          >
            Your account has been created successfully. Redirecting to login...
          </p>
          <div
            className="loading-spinner"
            style={{ width: "2rem", height: "2rem", margin: "0 auto" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-container ${theme === "dark" ? "dark-theme" : ""}`}>
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our community and start reading</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister}>
          {/* Username Field */}
          <div className="form-field">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="field-wrapper">
              <User className="field-icon" />
              <input
                type="text"
                id="username"
                className={`input-field ${errors.username ? "error" : ""}`}
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={loading}
              />
            </div>
            {errors.username && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.username}</span>
              </div>
            )}
          </div>

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
                className={`input-field ${errors.email ? "error" : ""}`}
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.email}</span>
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
                className={`input-field ${errors.password ? "error" : ""}`}
                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="field-icon-right"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {form.password && (
              <div className="password-strength">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>Password strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.label === "Strong"
                        ? "strength-strong"
                        : passwordStrength.label === "Medium"
                        ? "strength-medium"
                        : "strength-weak"
                    }`}
                    style={{
                      color:
                        passwordStrength.label === "Strong"
                          ? "#10b981"
                          : passwordStrength.label === "Medium"
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="strength-bar">
                  <div
                    className={`strength-fill ${
                      passwordStrength.label === "Strong"
                        ? "strength-strong"
                        : passwordStrength.label === "Medium"
                        ? "strength-medium"
                        : "strength-weak"
                    }`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-field">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="field-wrapper">
              <Shield className="field-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`input-field ${
                  errors.confirmPassword ? "error" : ""
                }`}
                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="field-icon-right"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-container">
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", height: "3rem" }}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
