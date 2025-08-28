import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Heart, Bookmark, BookmarkCheck, MessageCircle, Share2, ExternalLink, Calendar, User } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { addToast } from "../../store/slices/uiSlice";
import defaultImage from "../../assets/default.png";

export default function UserProfileModal({ article, onClose }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookmarks, likes } = useSelector((state) => state.user);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState(false);

  const isLiked = likes.includes(article._id);
  const isBookmarked = bookmarks.includes(article._id);

  // Load comments when modal opens
  useEffect(() => {
    if (article._id) {
      fetchComments();
    }
  }, [article._id]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/comments/${article._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    if (isProcessingLike) return;
    
    setIsProcessingLike(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/articles/${article._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      dispatch(addToast({
        message: response.data.message,
        type: "success"
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.response?.data?.error || "Failed to update like",
        type: "error"
      }));
    } finally {
      setIsProcessingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (isProcessingBookmark) return;
    
    setIsProcessingBookmark(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/articles/${article._id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      dispatch(addToast({
        message: response.data.message,
        type: "success"
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.response?.data?.error || "Failed to update bookmark",
        type: "error"
      }));
    } finally {
      setIsProcessingBookmark(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/comments`,
        {
          articleId: article._id,
          content: newComment.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => [...prev, response.data]);
      setNewComment("");
      dispatch(addToast({
        message: "Comment added successfully!",
        type: "success"
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.response?.data?.error || "Failed to add comment",
        type: "error"
      }));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
      dispatch(addToast({
        message: "Article URL copied to clipboard!",
        type: "success"
      }));
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
          borderRadius: "12px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px"
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: "0 0 10px 0",
              fontSize: "24px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: theme === "dark" ? "#ffffff" : "#111827"
            }}>
              {article.title}
            </h2>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              fontSize: "14px",
              color: theme === "dark" ? "#9ca3af" : "#6b7280"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={16} />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <User size={16} />
                {article.author || article.source?.name || "Unknown"}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              color: theme === "dark" ? "#9ca3af" : "#6b7280",
              backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {/* Article Image */}
          {article.urlToImage && (
            <div style={{ marginBottom: "20px" }}>
              <img
                src={article.urlToImage}
                alt={article.title}
                onError={(e) => { e.target.src = defaultImage; }}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}

          {/* Article Description */}
          <div style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: theme === "dark" ? "#e5e7eb" : "#374151",
            marginBottom: "20px"
          }}>
            {article.description || article.content || "No description available."}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={handleLike}
              disabled={isProcessingLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: isProcessingLike ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: isLiked 
                  ? "#ef4444" 
                  : theme === "dark" ? "#374151" : "#f3f4f6",
                color: isLiked 
                  ? "#ffffff" 
                  : theme === "dark" ? "#e5e7eb" : "#374151",
                opacity: isProcessingLike ? 0.6 : 1
              }}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? "Liked" : "Like"}
            </button>

            <button
              onClick={handleBookmark}
              disabled={isProcessingBookmark}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: isProcessingBookmark ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: isBookmarked 
                  ? "#3b82f6" 
                  : theme === "dark" ? "#374151" : "#f3f4f6",
                color: isBookmarked 
                  ? "#ffffff" 
                  : theme === "dark" ? "#e5e7eb" : "#374151",
                opacity: isProcessingBookmark ? 0.6 : 1
              }}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                color: theme === "dark" ? "#e5e7eb" : "#374151"
              }}
            >
              <Share2 size={16} />
              Share
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#10b981",
                color: "#ffffff"
              }}
            >
              <ExternalLink size={16} />
              Read Full Article
            </a>
          </div>

          {/* Comments Section */}
          <div style={{
            borderTop: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
            paddingTop: "20px"
          }}>
            <h3 style={{
              margin: "0 0 15px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: theme === "dark" ? "#ffffff" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <MessageCircle size={20} />
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: `1px solid ${theme === "dark" ? "#374151" : "#d1d5db"}`,
                    borderRadius: "8px",
                    backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                    color: theme === "dark" ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    resize: "vertical",
                    minHeight: "80px"
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: (!newComment.trim() || isSubmittingComment) ? "not-allowed" : "pointer",
                    opacity: (!newComment.trim() || isSubmittingComment) ? 0.6 : 1,
                    alignSelf: "flex-start"
                  }}
                >
                  {isSubmittingComment ? "Posting..." : "Post"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} style={{
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                    border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px"
                    }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}>
                        {comment.user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: theme === "dark" ? "#e5e7eb" : "#374151"
                        }}>
                          {comment.user?.username || "Anonymous"}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: theme === "dark" ? "#9ca3af" : "#6b7280"
                        }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.5",
                      color: theme === "dark" ? "#e5e7eb" : "#374151"
                    }}>
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: theme === "dark" ? "#9ca3af" : "#6b7280"
                }}>
                  <MessageCircle size={48} style={{ marginBottom: "15px", opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: "16px" }}>No comments yet</p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
