import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import UserAvatar from "./UserAvatar";
import {
  Search,
  User,
  Settings,
  LogOut,
  Home,
  Bookmark,
  Sun,
  Moon,
  Menu,
  X,
  Newspaper,
  UserCircle,
  Bell,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import "../css/Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  // Get user data from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    // Clear user data
    dispatch(logout());

    // Clear bookmarks and likes
    import("../../store/slices/newsSlice").then(
      ({ clearBookmarks, clearLikes }) => {
        dispatch(clearBookmarks());
        dispatch(clearLikes());
      }
    );

    // Close dropdowns
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    // Navigate to login
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo and Home Link */}
        <div className="brand-section">
          <Link className="navbar-brand" to="/news" onClick={closeMenus}>
            <div className="brand-content">
              <Newspaper className="brand-icon" />
              <span className="brand-text">NewsHub</span>
            </div>
          </Link>
          <Link
            className="nav-link home-link d-flex align-items-center gap-2"
            to="/featured"
            onClick={closeMenus}
          >
            <TrendingUp className="nav-icon" />
            <span>Trending</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {/* Navigation Links - Removed Bookmarks */}
          {/* <div className="nav-links"> */}
          {/* Navigation links removed since Home is now beside logo */}
          {/* </div> */}

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                className="search-input"
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="search-button" type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="theme-icon" />
            ) : (
              <Moon className="theme-icon" />
            )}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                <div className="user-info">
                  <UserAvatar size="small" />

                  <span className="user-name">
                    {user?.username || user?.name || "User"}
                  </span>
                  <ChevronDown
                    className={`chevron ${dropdownOpen ? "rotated" : ""}`}
                  />
                </div>
              </button>

              <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                <div className="dropdown-header">
                  <div className="user-profile">
                    <UserAvatar size="medium" showName={false} />

                    <div className="profile-info">
                      <div className="profile-name">
                        {user?.username || user?.name || "User"}
                      </div>
                      <div className="profile-email">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <Link
                  className="dropdown-item"
                  to="/profile"
                  onClick={closeMenus}
                >
                  <User className="dropdown-icon" />
                  <span>Profile</span>
                </Link>

                <Link
                  className="dropdown-item"
                  to="/profile/edit"
                  onClick={closeMenus}
                >
                  <Settings className="dropdown-icon" />
                  <span>Settings</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut className="dropdown-icon" />
                  <span>Logout</span>
                </button>
                <button
                  className="dropdown-item logout-item"
                  onClick={() => navigate("/admin/login")}
                >
                  <LogOut className="dropdown-icon" />
                  <span>admin login</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link className="nav-link" to="/login" onClick={closeMenus}>
                <span>Login</span>
              </Link>
              <Link
                className="nav-link primary"
                to="/register"
                onClick={closeMenus}
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-controls">
          <button
            className="theme-toggle mobile"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          {/* Mobile Search */}
          <form className="mobile-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                className="search-input"
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            <Link className="mobile-nav-link" to="/news" onClick={closeMenus}>
              <Home className="mobile-nav-icon" />
              <span>Home</span>
            </Link>
          </div>

          {/* Mobile User Section */}
          {isAuthenticated ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <UserAvatar size="large" showName={true} />
                <div className="mobile-user-details">
                  <div className="mobile-user-email">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </div>

              <div className="mobile-user-links">
                <Link
                  className="mobile-nav-link"
                  to="/profile"
                  onClick={closeMenus}
                >
                  <User className="mobile-nav-icon" />
                  <span>Profile</span>
                </Link>
                <Link
                  className="mobile-nav-link"
                  to="/profile/edit"
                  onClick={closeMenus}
                >
                  <Settings className="mobile-nav-icon" />
                  <span>Settings</span>
                </Link>
                <button
                  className="mobile-nav-link logout"
                  onClick={handleLogout}
                >
                  <LogOut className="mobile-nav-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-links">
              <Link
                className="mobile-auth-link"
                to="/login"
                onClick={closeMenus}
              >
                Login
              </Link>
              <Link
                className="mobile-auth-link primary"
                to="/register"
                onClick={closeMenus}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
