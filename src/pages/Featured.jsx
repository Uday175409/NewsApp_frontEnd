
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";
import { openArticleModal, closeArticleModal } from "../store/slices/uiSlice";
import ArticleCard from "../components/shared/ArticleCard";
import ArticleModalSimple from "../components/shared/ArticleModalSimple";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function Featured() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);

  // Handle refresh functionality
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchTrending();
  };

  const fetchTrending = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/article/featured`);
      setArticles(res.data.articles || []);
    } catch (err) {
      setError("Failed to load trending articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  // Animated skeleton loader for trending articles
  const LoadingCard = () => (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className={`card h-100 animate__animated animate__pulse animate__faster ${theme === 'dark' ? 'bg-dark border-secondary text-light' : 'bg-light'}`}
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
        <div className={`d-flex justify-content-center align-items-center ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`} style={{ height: '200px' }}>
          <div className={`spinner-border ${theme === 'dark' ? 'text-light' : 'text-primary'}`} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <div className="card-body">
          <div className="placeholder-glow">
            <span className={`placeholder col-8 mb-2 ${theme === 'dark' ? 'bg-secondary' : ''}`}></span>
            <span className={`placeholder col-6 mb-2 ${theme === 'dark' ? 'bg-secondary' : ''}`}></span>
            <span className={`placeholder col-4 mb-2 ${theme === 'dark' ? 'bg-secondary' : ''}`}></span>
            <span className={`placeholder col-10 mb-2 ${theme === 'dark' ? 'bg-secondary' : ''}`}></span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`container-fluid py-4 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}> 
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className={`display-4 fw-bold text-center mb-3 ${theme === 'dark' ? 'text-light' : ''}`}
            style={{ letterSpacing: '2px', textShadow: theme === 'dark' ? '0 2px 8px #222' : '0 2px 8px #eee' }}>
            <span className="me-2">
              <i className="fas fa-fire text-warning animate__animated animate__bounce animate__infinite"></i>
            </span>
            Trending News
          </h1>
          <p className={`lead text-center ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}
            style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            The most popular news stories right now
          </p>
        </div>
      </div>

      {/* Articles Count and Refresh */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <p className={`mb-0 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}
              style={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {loading ? 'Loading...' : `${articles.length} trending articles`}
            </p>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary'}`}
              onClick={handleRefresh}
              disabled={loading}
              style={{ borderRadius: '24px', fontWeight: 600, letterSpacing: '1px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Refresh trending articles"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              ) : (
                <i className="fas fa-sync-alt me-2"></i>
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`alert d-flex align-items-center ${theme === 'dark' ? 'alert-dark border-danger text-danger' : 'alert-danger'}`} role="alert" style={{ borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error Loading Articles</strong><br />
                {error}
                <button 
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-danger'} ms-2`}
                  onClick={handleRefresh}
                  style={{ borderRadius: '16px', fontWeight: 500 }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="row">
        {loading && articles.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={article._id || index} className="col-lg-4 col-md-6 mb-4">
              <div className={`card h-100 article-card-hover ${theme === 'dark' ? 'bg-dark border-secondary text-light' : 'bg-light'}`}
                style={{ borderRadius: '1rem', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                  <span className="badge bg-warning text-dark shadow-sm" style={{ fontWeight: 600, fontSize: '0.95rem', borderRadius: '12px' }}>
                    <i className="fas fa-fire me-1"></i> Trending
                  </span>
                </div>
                <ArticleCard article={article} />
              </div>
            </div>
          ))
        ) : !loading && !error ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className={`fas fa-newspaper fa-3x mb-3 ${theme === 'dark' ? 'text-light opacity-50' : 'text-muted'}`}></i>
              <h3 className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>No trending articles found</h3>
              <p className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Try refreshing or check back later</p>
              <button
                className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-primary'}`}
                onClick={() => navigate("/news")}
                style={{ borderRadius: '24px', fontWeight: 600 }}
              >
                Go to News
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Article Modal */}
      {modals.articleModal.isOpen && modals.articleModal.article && (
        <ArticleModalSimple
          article={modals.articleModal.article}
          onClose={() => dispatch(closeArticleModal())}
        />
      )}
    </div>
  );
}
