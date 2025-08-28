import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchArticles,
  searchArticles,
  setFilters,
  setSearchQuery,
  clearArticles,
  fetchFeaturedArticles,
} from "../store/slices/newsSlice";
import { openArticleModal, closeArticleModal } from "../store/slices/uiSlice";
import { useTheme } from "../contexts/ThemeContext";
import ArticleCard from "../components/shared/ArticleCard";

const categoryOptions = [
  { value: "top", label: "Top Stories" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "politics", label: "Politics" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "world", label: "World" },
];

const countryOptions = [
  { code: "in", label: "India 🇮🇳" },
  { code: "us", label: "USA 🇺🇸" },
  { code: "gb", label: "UK 🇬🇧" },
  { code: "au", label: "Australia 🇦🇺" },
  { code: "ca", label: "Canada 🇨🇦" },
];

const languageOptions = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "jp", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "nl", label: "Dutch" },
  { code: "sv", label: "Swedish" },
  { code: "no", label: "Norwegian" },
  { code: "da", label: "Danish" },
];

export default function News() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const { articles, featuredArticles, loading, error, filters, pagination } =
    useSelector((state) => state.news);

  const { modals } = useSelector((state) => state.ui);

  // Debug modal state
  useEffect(() => {
    console.log("Modal state changed:", modals.articleModal);
  }, [modals.articleModal]);

  // Fetch featured articles on component mount
  useEffect(() => {
    dispatch(fetchFeaturedArticles());
  }, []);

  useEffect(() => {
    // Handle URL search params and set filters
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get("search");
    const urlCategory = urlParams.get("category");

    let shouldFetch = false;
    const newFilters = {};

    if (urlSearch && urlSearch !== filters.searchQuery) {
      dispatch(setSearchQuery(urlSearch));
      newFilters.searchQuery = urlSearch;
      shouldFetch = true;
    }
    if (urlCategory && urlCategory !== filters.category) {
      newFilters.category = urlCategory;
      shouldFetch = true;
    }

    if (shouldFetch && Object.keys(newFilters).length > 0) {
      dispatch(setFilters(newFilters));
    }
  }, [location.search, dispatch, filters.searchQuery, filters.category]);

  useEffect(() => {
    // Fetch articles when filters change (with debounce to prevent duplicate calls)
    const timeoutId = setTimeout(() => {
      if (filters.searchQuery) {
        dispatch(
          searchArticles({
            query: filters.searchQuery,
            category: filters.category,
            country: filters.country,
            lang: filters.language,
            max: 12,
          })
        );
      } else {
        dispatch(
          fetchArticles({
            category: filters.category,
            country: filters.country,
            lang: filters.language,
            max: 20,
          })
        );
      }
    }, 100); // Small debounce to prevent rapid successive calls

    return () => clearTimeout(timeoutId);
  }, [
    filters.category,
    filters.country,
    filters.searchQuery,
    filters.language,
    dispatch,
  ]);

  const handleFilterChange = (filterType, value) => {
    dispatch(clearArticles());
    dispatch(setFilters({ [filterType]: value }));

    // Update URL if it's a category change
    if (filterType === "category") {
      navigate(`/news?category=${value}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("search");

    dispatch(setSearchQuery(query));
    dispatch(clearArticles());

    if (query.trim()) {
      navigate(`/news?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/news");
    }
  };

  const handleLoadMore = () => {
    if (pagination.nextPage && !loading) {
      if (filters.searchQuery) {
        dispatch(
          searchArticles({
            query: filters.searchQuery,
            category: filters.category,
            country: filters.country,
            lang: filters.language,
            max: 12,
            page: pagination.nextPage,
            isLoadMore: true,
          })
        );
      } else {
        dispatch(
          fetchArticles({
            category: filters.category,
            country: filters.country,
            lang: filters.language,
            max: 12,
            page: pagination.nextPage,
            isLoadMore: true,
          })
        );
      }
    }
  };

  const handleRefresh = () => {
    dispatch(clearArticles());
    if (filters.searchQuery) {
      dispatch(
        searchArticles({
          query: filters.searchQuery,
          category: filters.category,
          country: filters.country,
          lang: filters.language,
          max: 12,
        })
      );
    } else {
      dispatch(
        fetchArticles({
          category: filters.category,
          country: filters.country,
          lang: filters.language,
          max: 12,
        })
      );
    }
  };

  const LoadingCard = () => (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <div
          className="bg-light d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
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
  );

  return (
    <div
      className={`container-fluid py-4 ${
        theme === "dark" ? "bg-dark text-light" : ""
      }`}
    >
      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && !filters.searchQuery && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-primary text-white p-4 rounded mb-4">
              <div className="text-center">
                <h2 className="display-5 fw-bold mb-2">Featured Stories</h2>
                <p className="lead mb-0">
                  Top breaking news from around the world
                </p>
              </div>
            </div>
            <div className="row">
              {featuredArticles.slice(0, 3).map((article, index) => (
                <div
                  key={article._id || index}
                  className="col-lg-4 col-md-6 mb-4"
                >
                  <ArticleCard article={article} variant="featured" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {featuredArticles.length > 3 && !filters.searchQuery && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button
              className="btn btn-outline-primary btn-lg"
              onClick={() => {
                navigate("/featured");
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Loading More...
                </>
              ) : (
                <>
                  Load More Articles
                  <i className="fas fa-chevron-down ms-2"></i>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1
            className={`display-4 fw-bold text-center mb-3 ${
              theme === "dark" ? "text-light" : ""
            }`}
          >
            {filters.searchQuery
              ? `Search Results for "${filters.searchQuery}"`
              : "Latest News"}
          </h1>
          <p
            className={`lead text-center ${
              theme === "dark" ? "text-light opacity-75" : "text-muted"
            }`}
          >
            Stay updated with the latest news from around the world
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Category Filter */}
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Country</label>
                  <select
                    className="form-select"
                    value={filters.country}
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                  >
                    {countryOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Language</label>
                  <select
                    className="form-select"
                    value={filters.language || "en"}
                    onChange={(e) =>
                      handleFilterChange("language", e.target.value)
                    }
                  >
                    {languageOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Search</label>
                  <form onSubmit={handleSearch}>
                    <div className="input-group">
                      <input
                        type="text"
                        name="search"
                        className="form-control"
                        placeholder="Search articles..."
                        defaultValue={filters.searchQuery}
                      />
                      <button className="btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Refresh Button */}
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                    ) : (
                      <i className="fas fa-sync-alt me-2"></i>
                    )}
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Count */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0">
              {loading ? "Loading..." : `${articles.length} articles found`}
              {filters.searchQuery && ` for "${filters.searchQuery}"`}
            </p>
            {articles.length > 0 && (
              <div className="d-flex gap-2">
                <span className="badge bg-primary">{filters.category}</span>
                <span className="badge bg-secondary">
                  {filters.country.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error Loading Articles</strong>
                <br />
                {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={handleRefresh}
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
          // Loading cards for initial load
          Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : articles.length > 0 ? (
          // Article cards
          articles.map((article, index) => (
            <div key={article._id || index} className="col-lg-4 col-md-6 mb-4">
              <ArticleCard article={article} />
            </div>
          ))
        ) : (
          // No articles found
          <div className="col-12">
            <div className="text-center py-5">
              <i
                className={`fas fa-newspaper fa-3x mb-3 ${
                  theme === "dark" ? "text-light opacity-50" : "text-muted"
                }`}
              ></i>
              <h3
                className={
                  theme === "dark" ? "text-light opacity-75" : "text-muted"
                }
              >
                No articles found
              </h3>
              <p
                className={
                  theme === "dark" ? "text-light opacity-75" : "text-muted"
                }
              >
                Try adjusting your search criteria or filters
              </p>
              <button
                className={`btn ${
                  theme === "dark" ? "btn-outline-light" : "btn-primary"
                }`}
                onClick={() => {
                  dispatch(setSearchQuery(""));
                  dispatch(setFilters({ category: "top", searchQuery: "" }));
                  navigate("/news");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && articles.length > 0 && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button
              className="btn btn-outline-primary btn-lg"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Loading More...
                </>
              ) : (
                <>
                  Load More Articles
                  <i className="fas fa-chevron-down ms-2"></i>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
