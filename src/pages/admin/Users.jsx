import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  deleteUser,
  fetchUserDetails,
  clearSelectedUser,
  logout,
} from "../../store/slices/adminSlice";
import { useTheme } from "../../contexts/ThemeContext";
import AdminLayout from "../../components/shared/admin/AdminLayout";
import UserTable from "../../components/shared/admin/UserTable";
import UserModal from "../../components/shared/admin/UserModal";
import Counter from "../../components/ui/counter/Counter";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    isAuthenticated,
    users,
    usersPagination,
    selectedUser,
    loading,
    error,
    admin,
  } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentPage, sortBy, sortOrder, searchTerm]);

  const fetchUsers = () => {
    dispatch(
      fetchAllUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        sortBy,
        sortOrder,
      })
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleUserDetails = (userId) => {
    dispatch(fetchUserDetails(userId));
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      dispatch(deleteUser(userId));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const closeModal = () => {
    setShowUserModal(false);
    dispatch(clearSelectedUser());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`min-vh-100 ${theme === "dark" ? "bg-dark" : "bg-light"}`}>
      {/* Header */}
      <nav
        className={`navbar navbar-expand-lg ${
          theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-white"
        } shadow-sm`}
      >
        <div className="container-fluid">
          <div className="navbar-brand fw-bold">
            <button
              className="btn btn-link text-decoration-none p-0 me-2"
              onClick={() => navigate("/admin/dashboard")}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <i className="fas fa-users text-primary me-2"></i>
            User Management
          </div>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="btn btn-link nav-link dropdown-toggle text-decoration-none"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user-circle me-1"></i>
                {admin?.email}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Search and Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className={`card border-0 shadow-sm ${
                theme === "dark" ? "bg-dark border-secondary" : ""
              }`}
            >
              <div className="card-body">
                <form onSubmit={handleSearch}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label
                        className={`form-label fw-semibold ${
                          theme === "dark" ? "text-light" : ""
                        }`}
                      >
                        Search Users
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          theme === "dark"
                            ? "bg-dark text-light border-secondary"
                            : ""
                        }`}
                        placeholder="Search by username, email, or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label
                        className={`form-label fw-semibold ${
                          theme === "dark" ? "text-light" : ""
                        }`}
                      >
                        Sort By
                      </label>
                      <select
                        className={`form-select ${
                          theme === "dark"
                            ? "bg-dark text-light border-secondary"
                            : ""
                        }`}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="createdAt">Registration Date</option>
                        <option value="username">Username</option>
                        <option value="email">Email</option>
                        <option value="bookmarkCount">Bookmarks</option>
                        <option value="viewCount">Views</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label
                        className={`form-label fw-semibold ${
                          theme === "dark" ? "text-light" : ""
                        }`}
                      >
                        Order
                      </label>
                      <select
                        className={`form-select ${
                          theme === "dark"
                            ? "bg-dark text-light border-secondary"
                            : ""
                        }`}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button type="submit" className="btn btn-primary w-100">
                        <i className="fas fa-search me-2"></i>
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <div
              className={`card border-0 shadow-sm ${
                theme === "dark" ? "bg-dark border-secondary" : ""
              }`}
            >
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className={`mb-0 ${theme === "dark" ? "text-light" : ""}`}>
                  <i className="fas fa-users me-2"></i>
                  Users ({usersPagination?.totalUsers || 0})
                </h5>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading users...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger m-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No users found</h5>
                    <p className="text-muted">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table
                      className={`table table-hover mb-0 ${
                        theme === "dark" ? "table-dark" : ""
                      }`}
                    >
                      <thead className="table-primary">
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Country</th>
                          <th>Activity</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {user.username?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </div>
                                <div>
                                  <div className="fw-semibold">
                                    {user.username}
                                  </div>
                                  {user.phone && (
                                    <small className="text-muted">
                                      {user.phone}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {user.profile?.country || "Not set"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <span
                                  className="badge bg-primary"
                                  title="Bookmarks"
                                >
                                  <i className="fas fa-bookmark me-1"></i>
                                  <Counter value={user.bookmarkCount || 0} />
                                </span>
                                <span className="badge bg-danger" title="Likes">
                                  <i className="fas fa-heart me-1"></i>
                                  <Counter value={user.likeCount || 0} />
                                </span>
                                <span
                                  className="badge bg-success"
                                  title="Views"
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  <Counter value={user.viewCount || 0} />
                                </span>
                              </div>
                            </td>
                            <td>
                              <small>{formatDate(user.createdAt)}</small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-info"
                                  onClick={() => handleUserDetails(user._id)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDeleteUser(user._id)}
                                  title="Delete User"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {usersPagination && usersPagination.totalPages > 1 && (
                <div className="card-footer">
                  <nav>
                    <ul className="pagination justify-content-center mb-0">
                      <li
                        className={`page-item ${
                          !usersPagination.hasPrevPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!usersPagination.hasPrevPage}
                        >
                          Previous
                        </button>
                      </li>

                      {[...Array(usersPagination.totalPages)].map(
                        (_, index) => (
                          <li
                            key={index + 1}
                            className={`page-item ${
                              currentPage === index + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        )
                      )}

                      <li
                        className={`page-item ${
                          !usersPagination.hasNextPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!usersPagination.hasNextPage}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div
              className={`modal-content ${
                theme === "dark" ? "bg-dark border-secondary" : ""
              }`}
            >
              <div className="modal-header">
                <h5
                  className={`modal-title ${
                    theme === "dark" ? "text-light" : ""
                  }`}
                >
                  <i className="fas fa-user me-2"></i>
                  User Details - {selectedUser.user.username}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6
                      className={`fw-bold ${
                        theme === "dark" ? "text-light" : ""
                      }`}
                    >
                      Personal Information
                    </h6>
                    <table
                      className={`table table-sm ${
                        theme === "dark" ? "table-dark" : ""
                      }`}
                    >
                      <tbody>
                        <tr>
                          <td>
                            <strong>Username:</strong>
                          </td>
                          <td>{selectedUser.user.username}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Email:</strong>
                          </td>
                          <td>{selectedUser.user.email}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Phone:</strong>
                          </td>
                          <td>{selectedUser.user.phone || "Not provided"}</td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Country:</strong>
                          </td>
                          <td>
                            {selectedUser.user.profile?.country ||
                              "Not specified"}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Language:</strong>
                          </td>
                          <td>
                            {selectedUser.user.profile?.language || "English"}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Joined:</strong>
                          </td>
                          <td>{formatDate(selectedUser.user.createdAt)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6
                      className={`fw-bold ${
                        theme === "dark" ? "text-light" : ""
                      }`}
                    >
                      Activity Statistics
                    </h6>
                    <table
                      className={`table table-sm ${
                        theme === "dark" ? "table-dark" : ""
                      }`}
                    >
                      <tbody>
                        <tr>
                          <td>
                            <strong>Total Bookmarks:</strong>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              <Counter
                                value={
                                  selectedUser.activityStats.totalBookmarks
                                }
                              />
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Total Likes:</strong>
                          </td>
                          <td>
                            <span className="badge bg-danger">
                              <Counter
                                value={selectedUser.activityStats.totalLikes}
                              />
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Total Views:</strong>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              <Counter
                                value={selectedUser.activityStats.totalViews}
                              />
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedUser.user.profile?.bio && (
                  <div className="mt-3">
                    <h6
                      className={`fw-bold ${
                        theme === "dark" ? "text-light" : ""
                      }`}
                    >
                      Bio
                    </h6>
                    <p
                      className={`p-3 bg-light rounded ${
                        theme === "dark" ? "bg-secondary text-light" : ""
                      }`}
                    >
                      {selectedUser.user.profile.bio}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    closeModal();
                    handleDeleteUser(selectedUser.user._id);
                  }}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
