import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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
import { API_BASE_URL } from "../../config/api";
import { useTheme } from "../../contexts/ThemeContext";
import useAuthRedirect from "../../hooks/useAuthRedirect";
import defaultImage from "../../assets/default.png";
import CommentCard from "./CommentCard";
import { useNavigate } from "react-router-dom";

export default function ArticleModal({ article, onClose }) {
  console.log("ArticleModal rendered with article:", article?.title);
  console.log("ArticleModal rendered :", article);
  const navigate=useNavigate()

  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  useAuthRedirect(); // Add auth redirect hook

  console.log(
    "ArticleModal: hooks initialized, user:",
    user?.username || "none"
  );

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
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping article view tracking");
        return null;
      }

      const res = await axios.post(
        `${API_BASE_URL}/article/view`,
        {
          link: article.link,
          title: article.title,
          description: article.description || null,
          image_url: article.image_url || null,
          publishedAt: article.pubDate || null,
          author: article.creator || null,
          source_name: article.source_name || null,
          source_url: article.source_url || null,
          source_icon: article.source_icon || null,
          category: article.category || null,
          country: article.country || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return res.data.articleId;
    } catch (error) {
      console.error("Failed to mark article as viewed:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!article) return;

    // Store article and get ID - do this asynchronously without blocking
    const storeArticleAndSetId = async () => {
      try {
        const id = await ensureArticleInDatabase();
        if (id) {
          setArticleId(id);
        }
      } catch (error) {
        console.error("Error storing article:", error);
        // Don't let this error block the modal from opening
      }
    };
    
    // Don't await this - let it run in background
    storeArticleAndSetId();

    // Load article data immediately
    setLikeCount(article.likedBy?.length || 0);
    setIsBookmarked(false); // Check if bookmarked
    setIsLiked(false); // Check if liked

    // Add escape key listener
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [article, onClose]);

  // Handle reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      return () => contentElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleBookmark = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, cannot bookmark");
        return;
      }

      const id = articleId || (await ensureArticleInDatabase());
      if (!id) return;

      await axios.patch(
        `${API_BASE_URL}/article/bookmark`,
        { articleId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error bookmarking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, cannot like");
        return;
      }

      const id = articleId || (await ensureArticleInDatabase());
      if (!id) return;

      await axios.patch(
        `${API_BASE_URL}/article/like`,
        { articleId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error liking:", error);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const url = article.link || window.location.href;
    const title = article.title;
    const text = article.description;

    try {
      switch (platform) {
        case "native":
          if (navigator.share) {
            await navigator.share({ title, text, url });
          } else {
            await navigator.clipboard.writeText(url);
            // Show toast notification
          }
          break;
        case "copy":
          await navigator.clipboard.writeText(url);
          // Show toast notification
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              title
            )}&url=${encodeURIComponent(url)}`,
            "_blank"
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
      }
      setShowShareMenu(false);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  useEffect(() => {
    const checkUser = () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        // window.location.href = "/login";
        navigate("/login");
      }
    };
    checkUser();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // API call to submit comment
      setNewComment("");
      // fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const wordCount = (article.title + " " + (article.description || "")).split(
      " "
    ).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleReadFull = async () => {
    await ensureArticleInDatabase();
    window.open(article.link, "_blank");
  };

  if (!article) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200 ${
        theme === "dark" ? "bg-black/70" : "bg-black/50"
      }`}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-border z-60">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div
        ref={modalRef}
        className={`border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 backdrop-blur-sm ${
            theme === "dark"
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/90 border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-4">
            {article.source_icon && (
              <img
                src={article.source_icon}
                alt={article.source_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <div>
              <h3
                className={`font-semibold text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {article.source_name || "Unknown Source"}
              </h3>
              <div
                className={`flex items-center space-x-2 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDate(article.pubDate || article.publishedAt)}
                </span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{getReadingTime()} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Share article"
              >
                <Share2 className="h-5 w-5" />
              </button>

              {showShareMenu && (
                <div
                  ref={shareMenuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-20"
                >
                  <div className="p-2">
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Share on Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Share on Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>Share on LinkedIn</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bookmark Button - Only show for authenticated users */}
            {user && (
              <button
                onClick={handleBookmark}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                aria-label="Bookmark article"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="overflow-y-auto max-h-[calc(90vh-8rem)]"
        >
          {/* Featured Image */}
          {article.image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              {!imageLoaded && <div className="absolute inset-0 shimmer" />}
              <img
                src={article.image_url || defaultImage}
                alt={article.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = defaultImage;
                  setImageLoaded(true);
                }}
              />

              {/* Category Badge */}
              {article.category && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                    <Tag className="h-3 w-3 mr-1" />
                    {Array.isArray(article.category)
                      ? article.category.join(", ")
                      : article.category}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight">
                {article.title}
              </h1>

              {(article.author || article.creator) && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    By{" "}
                    {Array.isArray(article.creator)
                      ? article.creator.join(", ")
                      : article.creator || article.author}
                  </span>
                </div>
              )}

              {article.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {article.description}
                </p>
              )}
            </div>

            {/* Article Metadata */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-border">
              {/* Like Button - Only show for authenticated users */}
              {user && (
                <div className="flex items-center space-x-2">
                  <Heart
                    className={`h-5 w-5 cursor-pointer transition-colors ${
                      isLiked
                        ? "fill-current text-destructive"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                    onClick={handleLike}
                  />
                  <span className="text-sm">{likeCount}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{comments.length} comments</span>
              </div>

              {/* Sign in prompt for unauthenticated users */}
              {!user && (
                <div className="text-sm text-muted-foreground">
                  <span>
                    Sign in to like, bookmark, and comment on articles
                  </span>
                </div>
              )}

              {article.country && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">
                    {Array.isArray(article.country)
                      ? article.country.join(", ")
                      : article.country}
                  </span>
                </div>
              )}
            </div>

            {/* External Link */}
            {article.link && (
              <div className="bg-accent/30 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Read full article at
                    </p>
                    <p className="font-medium">{article.source_name}</p>
                  </div>
                  <button
                    onClick={handleReadFull}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Read More</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Comments Section - Only show for authenticated users */}
            {user && articleId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Comments</h3>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{showComments ? "Hide" : "Show"} Comments</span>
                    {showComments ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {showComments && <CommentCard articleId={articleId} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
