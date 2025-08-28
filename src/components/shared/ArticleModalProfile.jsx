import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  ExternalLink,
  Clock,
  User,
  Share2,
  Bookmark,
  BookmarkCheck,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Globe,
  Tag,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Send,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import defaultImage from "../../assets/default.png";
import { addToast } from "../../store/slices/uiSlice";

export default function ArticleModalProfile({ article, onClose }) {
  console.log("ArticleModalProfile rendered with article:", article?.title);
  
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [articleId, setArticleId] = useState(null);

  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const shareMenuRef = useRef(null);

  // Helper to send /view and return articleId
  const ensureArticleInDatabase = async () => {
    try {
      console.log("🔄 ARTICLE MODAL - Ensuring article exists in database");
      console.log("📋 Article data:", article);

      const response = await axios.post(
        "http://localhost:4000/api/article/view",
        {
          link: article.link || article.url || `#${article.title}`,
          title: article.title,
          description: article.description,
          image_url: article.image_url || article.urlToImage,
          publishedAt: article.publishedAt || article.pubDate,
          author: article.author,
          source_name: article.source_name || article.source_id,
          source_url: article.source_url,
          source_icon: article.source_icon,
          category: article.category,
          country: article.country,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ ARTICLE MODAL - Article view response:", response.data);
      return response.data.articleId;
    } catch (error) {
      console.error("❌ ARTICLE MODAL - Error viewing article:", error);
      if (error.response?.status === 401) {
        // Don't show auth errors in profile modal
        console.log("⚠️ Authentication required for article actions");
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load article data'
        }));
      }
      return null;
    }
  };

  useEffect(() => {
    if (article && user) {
      ensureArticleInDatabase().then((id) => {
        if (id) {
          setArticleId(id);
          // Load article state (bookmarks, likes, comments)
          loadArticleState(id);
        }
      });
    }

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [article, onClose, user]);

  const loadArticleState = async (id) => {
    try {
      // Load bookmarks, likes, and comments for this article
      const [bookmarksRes, likesRes] = await Promise.all([
        axios.get("http://localhost:4000/api/article/bookmarks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/article/likes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        })
      ]);

      setIsBookmarked(bookmarksRes.data.bookmarks?.some(b => b._id === id) || false);
      setIsLiked(likesRes.data.likes?.some(l => l._id === id) || false);
      
    } catch (error) {
      console.error("Error loading article state:", error);
    }
  };

  // Handle reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setReadingProgress(progress);
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener("scroll", handleScroll);
      return () => content.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleBookmark = async () => {
    if (!user || !articleId) return;

    try {
      const response = await axios.patch(
        "http://localhost:4000/api/article/bookmark",
        { articleId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      setIsBookmarked(response.data.bookmarked);
      dispatch(addToast({
        type: 'success',
        title: response.data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks',
        message: response.data.message
      }));
    } catch (error) {
      console.error("Error bookmarking article:", error);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to bookmark article'
      }));
    }
  };

  const handleLike = async () => {
    if (!user || !articleId) return;

    try {
      const response = await axios.patch(
        "http://localhost:4000/api/article/like",
        { articleId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount || 0);
      dispatch(addToast({
        type: 'success',
        title: response.data.liked ? 'Liked!' : 'Unliked',
        message: response.data.message
      }));
    } catch (error) {
      console.error("Error liking article:", error);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to like article'
      }));
    }
  };

  const handleShare = async (platform) => {
    const url = article.link || article.url || window.location.href;
    const title = article.title;
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          dispatch(addToast({
            type: 'success',
            title: 'Copied!',
            message: 'Link copied to clipboard'
          }));
          setShowShareMenu(false);
          return;
        } catch (error) {
          dispatch(addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to copy link'
          }));
          return;
        }
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !articleId) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/comment/add",
        {
          articleId,
          content: newComment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      setComments([response.data.comment, ...comments]);
      setNewComment("");
      dispatch(addToast({
        type: 'success',
        title: 'Comment Added',
        message: 'Your comment has been posted'
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add comment'
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const wordCount = (article.description || "").split(" ").length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime);
  };

  const handleReadFull = async () => {
    if (article.link || article.url) {
      window.open(article.link || article.url, "_blank");
    }
  };

  if (!article) return null;

  return (
    <div
      className={`modal-overlay ${theme === "dark" ? "dark" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      {/* Reading Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${readingProgress}%`,
          height: "3px",
          backgroundColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
          zIndex: 1001,
          transition: "width 0.3s ease",
        }}
      />

      <div
        ref={modalRef}
        className={`modal-content ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white"}`}
        style={{
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className={`modal-header ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
          style={{
            padding: "24px",
            borderBottom: "1px solid",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                lineHeight: "1.2",
                margin: "0 0 12px 0",
              }}
            >
              {article.title}
            </h1>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                fontSize: "14px",
                color: theme === "dark" ? "#9ca3af" : "#6b7280",
                flexWrap: "wrap",
              }}
            >
              {article.source_name && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Globe size={16} />
                  <span style={{ fontWeight: "600" }}>{article.source_name}</span>
                </div>
              )}
              
              {article.publishedAt && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={16} />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              )}
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} />
                <span>{getReadingTime()} min read</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme === "dark" ? "#9ca3af" : "#6b7280",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {/* Article Image */}
          {(article.image_url || article.urlToImage) && (
            <div style={{ marginBottom: "24px" }}>
              <img
                src={article.image_url || article.urlToImage}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  opacity: imageLoaded ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = defaultImage;
                  setImageLoaded(true);
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div style={{ marginBottom: "32px" }}>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                color: theme === "dark" ? "#e5e7eb" : "#374151",
                marginBottom: "24px",
              }}
            >
              {article.description}
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              {user && (
                <>
                  <button
                    onClick={handleLike}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      border: "1px solid",
                      borderColor: isLiked ? "#ef4444" : (theme === "dark" ? "#374151" : "#d1d5db"),
                      borderRadius: "8px",
                      background: isLiked ? "#fef2f2" : "transparent",
                      color: isLiked ? "#ef4444" : (theme === "dark" ? "#e5e7eb" : "#374151"),
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                    {likeCount > 0 && <span>({likeCount})</span>}
                  </button>

                  <button
                    onClick={handleBookmark}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      border: "1px solid",
                      borderColor: isBookmarked ? "#3b82f6" : (theme === "dark" ? "#374151" : "#d1d5db"),
                      borderRadius: "8px",
                      background: isBookmarked ? "#eff6ff" : "transparent",
                      color: isBookmarked ? "#3b82f6" : (theme === "dark" ? "#e5e7eb" : "#374151"),
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                  </button>
                </>
              )}

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    border: "1px solid",
                    borderColor: theme === "dark" ? "#374151" : "#d1d5db",
                    borderRadius: "8px",
                    background: "transparent",
                    color: theme === "dark" ? "#e5e7eb" : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>

                {showShareMenu && (
                  <div
                    ref={shareMenuRef}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "8px",
                      background: theme === "dark" ? "#1f2937" : "white",
                      border: "1px solid",
                      borderColor: theme === "dark" ? "#374151" : "#d1d5db",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 1002,
                      minWidth: "160px",
                    }}
                  >
                    {[
                      { id: "copy", icon: Copy, label: "Copy Link" },
                      { id: "twitter", icon: Twitter, label: "Twitter" },
                      { id: "facebook", icon: Facebook, label: "Facebook" },
                      { id: "linkedin", icon: Linkedin, label: "LinkedIn" },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => handleShare(id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          color: theme === "dark" ? "#e5e7eb" : "#374151",
                          cursor: "pointer",
                          fontSize: "14px",
                          textAlign: "left",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = theme === "dark" ? "#374151" : "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleReadFull}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#3b82f6",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                <ExternalLink size={16} />
                <span>Read Full Article</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {user && (
            <div
              style={{
                borderTop: "1px solid",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                paddingTop: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  Comments ({comments.length})
                </h3>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    border: "none",
                    background: "transparent",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                  }}
                >
                  <MessageCircle size={16} />
                  <span>{showComments ? "Hide" : "Show"}</span>
                  {showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showComments && (
                <div>
                  {/* Add Comment Form */}
                  <form onSubmit={handleCommentSubmit} style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "600",
                          flexShrink: 0,
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            padding: "12px",
                            border: "1px solid",
                            borderColor: theme === "dark" ? "#374151" : "#d1d5db",
                            borderRadius: "8px",
                            background: theme === "dark" ? "#1f2937" : "white",
                            color: theme === "dark" ? "#e5e7eb" : "#374151",
                            fontSize: "14px",
                            resize: "vertical",
                            outline: "none",
                            transition: "border-color 0.2s",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#3b82f6";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = theme === "dark" ? "#374151" : "#d1d5db";
                          }}
                        />
                        
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || loading}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              border: "none",
                              borderRadius: "6px",
                              background: newComment.trim() && !loading ? "#3b82f6" : "#9ca3af",
                              color: "white",
                              cursor: newComment.trim() && !loading ? "pointer" : "not-allowed",
                              fontSize: "12px",
                              fontWeight: "500",
                              transition: "all 0.2s",
                            }}
                          >
                            <Send size={14} />
                            <span>{loading ? "Posting..." : "Post"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div style={{ space: "16px" }}>
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <div key={comment._id || index} style={{
                          padding: "16px",
                          borderRadius: "8px",
                          backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb",
                          marginBottom: "12px",
                          border: "1px solid",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <div style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}>
                              {comment.user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span style={{ 
                              fontWeight: "600", 
                              fontSize: "14px",
                              color: theme === "dark" ? "#e5e7eb" : "#374151"
                            }}>
                              {comment.user?.username || "Anonymous"}
                            </span>
                            <span style={{ 
                              fontSize: "12px", 
                              color: theme === "dark" ? "#9ca3af" : "#6b7280"
                            }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
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
                      <div
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: theme === "dark" ? "#9ca3af" : "#6b7280",
                        }}
                      >
                        <MessageCircle size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: "14px" }}>No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
