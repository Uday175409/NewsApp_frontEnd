import React, { useState } from "react";
import EmailVerification from "./EmailVerification.jsx";
import { useTheme } from "../../contexts/ThemeContext";
import ArticleCard from "./ArticleCard.jsx";
import ArticleModalSimple from "./ArticleModalSimple.jsx";
import Counter from "../ui/counter/Counter.jsx";
import { StylizedPhoneDisplay } from "../ui/PhoneDisplay.jsx";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [activityStats, setActivityStats] = useState({
    bookmarks: 0,
    likes: 0,
    views: 0,
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Get user data from localStorage only - NO REDUX, NO API CALLS
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

  // Manual fetch functions - only called when user clicks tabs or buttons
  const handleTabClick = async (tab) => {
    setActiveTab(tab);

    if (tab === "profile") {
      setArticles([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setTabLoading(true);

      const endpointMap = {
        bookmarks: "bookmarks",
        likes: "likes",
        history: "history",
      };

      const res = await axios.get(
        `${API_BASE_URL}/article/${endpointMap[tab]}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setArticles(res.data.articles || []);
    } catch (error) {
      console.error(`Failed to fetch ${tab}:`, error);
      setArticles([]);
    } finally {
      setTabLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("🔄 Loading activity stats...");

      const [bookmarksRes, likesRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/article/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/article/likes`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/article/history`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      setActivityStats({
        bookmarks: bookmarksRes.data.articles?.length || 0,
        likes: likesRes.data.articles?.length || 0,
        views: historyRes.data.articles?.length || 0,
      });

      console.log("✅ Activity stats loaded successfully");
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };
  useEffect(() => {
    loadStats();
  }, []);
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

  const LoadingCards = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="bg-light" style={{ height: "200px" }}>
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="placeholder-glow">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
            </div>
          </div>
        </div>
      </div>
    ));

  // Show verify button and modal only if user is not verified
  const showVerifyButton = user && !user.isVerified;

  return (
    <div className="container py-4">
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
                    src={
                      user?.profile?.profilePicture || "/src/assets/default.png"
                    }
                    alt="Profile pic"
                    className="rounded-circle img-fluid border border-light"
                    style={{
                      width: "200px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  {/* Move Verify Email button here */}
                  {showVerifyButton && (
                    <button
                      style={{
                        marginTop: 16,
                        background: theme === "dark" ? "#1565c0" : "#2196f3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 24px",
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                        boxShadow:
                          theme === "dark"
                            ? "0 2px 8px rgba(0,0,0,0.25)"
                            : "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                      onClick={() => setShowVerificationModal(true)}
                    >
                      Verify Email
                    </button>
                  )}
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
                    } d-flex align-items-center`}
                  >
                    <i className="fas fa-envelope me-1"></i>
                    {user?.email}
                    {user?.isVerified && (
                      <span title="Email verified" style={{ marginLeft: 8 }}>
                        <i
                          className="fas fa-check-circle"
                          style={{ color: "#2196f3", fontSize: "1.2em" }}
                        ></i>
                      </span>
                    )}
                  </p>
                  <p
                    className={`mb-2 ${
                      theme === "dark" ? "text-light opacity-75" : "text-muted"
                    }`}
                  >
                    <i className="fas fa-quote-left me-1"></i>
                    &nbsp;
                    {user?.profile?.bio || "No bio available"}
                    &nbsp;
                    <i className="fas fa-quote-right me-1"></i>
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
                onClick={() => handleTabClick("profile")}
              >
                <i className="fas fa-user me-1"></i>
                Profile
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "bookmarks" ? "active" : ""
                } ${
                  theme === "dark" && activeTab !== "bookmarks"
                    ? "text-light"
                    : ""
                }`}
                onClick={() => handleTabClick("bookmarks")}
              >
                <i className="fas fa-bookmark me-1"></i>
                Bookmarks
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "likes" ? "active" : ""} ${
                  theme === "dark" && activeTab !== "likes" ? "text-light" : ""
                }`}
                onClick={() => handleTabClick("likes")}
              >
                <i className="fas fa-heart me-1"></i>
                Liked Articles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "history" ? "active" : ""
                } ${
                  theme === "dark" && activeTab !== "history"
                    ? "text-light"
                    : ""
                }`}
                onClick={() => handleTabClick("history")}
              >
                <i className="fas fa-history me-1"></i>
                Reading History
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {activeTab === "profile" ? (
            // Profile Info Tab
            <div className="row">
              <div className="col-md-6">
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
                    <div className="mb-3">
                      <label
                        className={`form-label fw-semibold ${
                          theme === "dark" ? "text-light" : ""
                        }`}
                      >
                        Phone
                      </label>
                      <StylizedPhoneDisplay
                        phone={user?.phone || user?.profile?.phone}
                        theme={theme}
                      />
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

                    {/* Country and Language Row */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className={`form-label fw-semibold ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            <i className="fas fa-globe me-1"></i>
                            Country
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.profile?.country || "Not specified"}
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
                            <i className="fas fa-language me-1"></i>
                            Language
                          </label>
                          <p
                            className={`mb-0 ${
                              theme === "dark" ? "text-light" : ""
                            }`}
                          >
                            {user?.profile?.language || "English"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className={`card border-0 shadow-sm h-100 ${
                    theme === "dark" ? "bg-dark border-secondary" : ""
                  }`}
                >
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-bar me-2"></i>
                      Activity Stats
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border-end">
                          <h3 className="text-primary mb-1">
                            {/* <Counter value={activityStats.bookmarks} /> */}
                            <Counter value={activityStats.bookmarks} minimal={true} />
                          </h3>
                          <small className="text-muted">Bookmarks</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <h3 className="text-danger mb-1">
                            {/* <Counter value={activityStats.likes} /> */}

                            <Counter value={activityStats.likes} minimal={true} />
                          </h3>
                          <small className="text-muted">Likes</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <h3 className="text-success mb-1">
                          {/* <Counter value={activityStats.views} /> */}
                          <Counter value={activityStats.views} minimal={true} />
                        </h3>
                        <small className="text-muted">Views</small>
                      </div>
                    </div>
                    <hr />
                    <div className="text-center">
                      {/* <button
                        className="btn btn-sm btn-outline-primary mb-2"
                        onClick={loadStats}
                      >
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh Stats
                      </button> */}
                      <p className="mb-1">
                        <strong>Member Since</strong>
                      </p>
                      <p className="text-muted">
                        {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Articles Tab Content
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  {activeTab === "bookmarks" && "Bookmarked Articles"}
                  {activeTab === "likes" && "Liked Articles"}
                  {activeTab === "history" && "Reading History"}
                </h4>
                <span className="badge bg-primary">
                  {tabLoading ? "..." : articles.length} articles
                </span>
              </div>

              {tabLoading ? (
                <div className="row">
                  <LoadingCards />
                </div>
              ) : articles.length > 0 ? (
                <div className="row">
                  {articles.map((article, index) => (
                    <div
                      key={article._id || index}
                      className="col-lg-4 col-md-6 mb-4"
                    >
                      <ArticleCard
                        article={article}
                        onClick={() => setSelectedArticle(article)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No articles found</h5>
                  <p className="text-muted">
                    {activeTab === "bookmarks" &&
                      "You haven't bookmarked any articles yet."}
                    {activeTab === "likes" &&
                      "You haven't liked any articles yet."}
                    {activeTab === "history" && "No reading history available."}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/news")}
                  >
                    Browse Articles
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModalSimple
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Remove EmailVerification from main page, only show in modal */}
      {showVerificationModal && showVerifyButton && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background:
              theme === "dark" ? "rgba(20,20,20,0.7)" : "rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: theme === "dark" ? "#23272f" : "#fff",
              borderRadius: 14,
              boxShadow:
                theme === "dark"
                  ? "0 4px 24px rgba(0,0,0,0.32)"
                  : "0 4px 24px rgba(0,0,0,0.12)",
              padding: 32,
              minWidth: 340,
              maxWidth: 420,
              position: "relative",
              color: theme === "dark" ? "#fff" : "#222",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 22,
                color: theme === "dark" ? "#bbb" : "#888",
                cursor: "pointer",
              }}
              onClick={() => setShowVerificationModal(false)}
            >
              &times;
            </button>
            <EmailVerification />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
