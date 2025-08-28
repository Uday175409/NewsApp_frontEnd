import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const ProfileMinimal = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Get user data from localStorage only
  const getUserData = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        navigate("/login");
        return null;
      }
      
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error getting user data:", error);
      navigate("/login");
      return null;
    }
  };

  const user = getUserData();

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center py-5">
                <i className="fas fa-lock fa-3x text-danger mb-4"></i>
                <h3>Access Denied</h3>
                <p className="text-muted mb-4">
                  Please login to view your profile.
                </p>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h1
            className={`display-5 fw-bold mb-2 ${
              theme === "dark" ? "text-light" : ""
            }`}
          >
            User Dashboard (Minimal)
          </h1>
          <p
            className={
              theme === "dark" ? "text-light opacity-75" : "text-muted"
            }
          >
            Basic profile view without API calls
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className={`card border-0 shadow-sm ${
              theme === "dark" ? "bg-dark border-secondary" : ""
            }`}
          >
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <img
                    src={user?.profile?.profilePicture || "/src/assets/default.png"}
                    alt="Profile pic"
                    className="rounded-circle img-fluid border border-light"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <h4
                    className={`mb-1 ${theme === "dark" ? "text-light" : ""}`}
                  >
                    {user?.username || user?.name || "User"}
                  </h4>
                  <p
                    className={`mb-2 ${
                      theme === "dark" ? "text-light opacity-75" : "text-muted"
                    }`}
                  >
                    <i className="fas fa-envelope me-1"></i>
                    {user?.email}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="fas fa-calendar me-1"></i>
                    Joined {formatDate(user?.createdAt)}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/profile/edit")}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills justify-content-center">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "profile" ? "active" : ""
                } ${
                  theme === "dark" && activeTab !== "profile"
                    ? "text-light"
                    : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fas fa-user me-1"></i>
                Profile
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "info" ? "active" : ""
                } ${
                  theme === "dark" && activeTab !== "info"
                    ? "text-light"
                    : ""
                }`}
                onClick={() => setActiveTab("info")}
              >
                <i className="fas fa-info me-1"></i>
                Info
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {activeTab === "profile" ? (
            <div className="row">
              <div className="col-md-12">
                <div
                  className={`card border-0 shadow-sm h-100 ${
                    theme === "dark" ? "bg-dark border-secondary" : ""
                  }`}
                >
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-user me-2"></i>
                      Personal Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className={`form-label fw-semibold ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            Full Name
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.name || user?.username || "Not provided"}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label
                            className={`form-label fw-semibold ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            Email
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className={`form-label fw-semibold ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            Phone
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.phone || user?.profile?.phone || "Not provided"}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label
                            className={`form-label fw-semibold ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            Bio
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.profile?.bio || "No bio available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-info-circle fa-3x text-primary mb-3"></i>
              <h5>Information Tab</h5>
              <p className="text-muted">This is a minimal profile component without API calls.</p>
              <p className="text-muted">No infinite loops here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMinimal;
