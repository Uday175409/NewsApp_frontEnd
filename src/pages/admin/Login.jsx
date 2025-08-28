import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogin, clearError } from "../../store/slices/adminSlice";
import { useTheme } from "../../contexts/ThemeContext";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { theme } = useTheme();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.admin
  );

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(adminLogin(credentials));
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className={`min-vh-100 d-flex align-items-center ${
        theme === "dark" ? "bg-dark" : "bg-light"
      }`}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div
              className={`card shadow-lg border-0 ${
                theme === "dark" ? "bg-dark border-secondary" : ""
              }`}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                  <h2
                    className={`fw-bold ${
                      theme === "dark" ? "text-light" : ""
                    }`}
                  >
                    Admin Portal
                  </h2>
                  <p
                    className={`text-muted ${
                      theme === "dark" ? "text-light opacity-75" : ""
                    }`}
                  >
                    Sign in to access the admin dashboard
                  </p>
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className={`form-label fw-semibold ${
                        theme === "dark" ? "text-light" : ""
                      }`}
                    >
                      <i className="fas fa-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        theme === "dark"
                          ? "bg-dark text-light border-secondary"
                          : ""
                      }`}
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="admin@newsapp.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className={`form-label fw-semibold ${
                        theme === "dark" ? "text-light" : ""
                      }`}
                    >
                      <i className="fas fa-lock me-2"></i>Password
                    </label>
                    <div className="d-flex">
                      <input
                        type={show ? "text" : "password"}
                        name="password"
                        className={`form-control ${
                          theme === "dark"
                            ? "bg-dark text-light border-secondary"
                            : ""
                        }`}
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Enter admin password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => setShow(!show)}
                      >
                        {show ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small
                    className={`text-muted ${
                      theme === "dark" ? "text-light opacity-75" : ""
                    }`}
                  >
                    <i className="fas fa-info-circle me-1"></i>Admin credentials
                    are configured in the environment
                  </small>
                </div>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => navigate("/")}
                  >
                    <i className="fas fa-arrow-left me-1"></i>Back to Main Site
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
