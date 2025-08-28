import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBookmarks, fetchBookmarks } from '../store/slices/newsSlice';
import ArticleCard from '../components/shared/ArticleCard';

export default function Bookmarks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookmarkedArticles, loading, error } = useSelector((state) => state.news);

  // Fetch bookmarks from backend when component mounts
  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
      dispatch(clearBookmarks());
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error Loading Bookmarks</strong><br />
                {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={() => dispatch(fetchBookmarks())}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 fw-bold mb-2">
                <i className="fas fa-bookmark text-warning me-3"></i>
                My Bookmarks
              </h1>
              <p className="lead text-muted">
                {loading ? 'Loading...' : `Your saved articles (${bookmarkedArticles.length})`}
              </p>
            </div>
            {bookmarkedArticles.length > 0 && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleClearAll}
                >
                  <i className="fas fa-trash me-2"></i>
                  Clear All
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/news')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Find More Articles
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarked Articles */}
      {loading && bookmarkedArticles.length === 0 ? (
        // Loading State
        <div className="row">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookmarkedArticles.length > 0 ? (
        <div className="row">
          {bookmarkedArticles.map((article, index) => (
            <div key={`${article.title}-${index}`} className="col-lg-4 col-md-6 mb-4">
              <div className="position-relative">
                <ArticleCard article={article} />
                {/* Bookmarked Date Badge */}
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-bookmark me-1"></i>
                    Saved {new Date(article.bookmarkedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="far fa-bookmark fa-5x text-muted"></i>
              </div>
              <h3 className="text-muted mb-3">No bookmarks yet</h3>
              <p className="text-muted mb-4">
                Start bookmarking articles you want to read later!<br />
                Look for the bookmark icon on article cards.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/news')}
              >
                <i className="fas fa-newspaper me-2"></i>
                Browse Articles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {bookmarkedArticles.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-chart-bar me-2"></i>
                  Bookmark Statistics
                </h5>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{bookmarkedArticles.length}</h4>
                      <small className="text-muted">Total Bookmarks</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-success mb-1">
                        {new Set(bookmarkedArticles.map(a => a.category)).size}
                      </h4>
                      <small className="text-muted">Categories</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-warning mb-1">
                        {new Set(bookmarkedArticles.map(a => a.source_id || a.source_name)).size}
                      </h4>
                      <small className="text-muted">Sources</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <h4 className="text-info mb-1">
                      {bookmarkedArticles.filter(a => 
                        new Date(a.bookmarkedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </h4>
                    <small className="text-muted">This Week</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
