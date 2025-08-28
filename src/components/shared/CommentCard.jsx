import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Send, 
  User,
  MoreHorizontal,
  Flag,
  Trash2,
  Edit3,
  Check,
  X
} from "lucide-react";

export default function CommentCard({ articleId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/comments/${articleId}`,
        { withCredentials: true }
      );
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await axios.post(
        `http://localhost:4000/api/comments/${articleId}`,
        {
          commentText: newComment,
        },
        { withCredentials: true }
      );

      setNewComment("");
      fetchComments();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/comments/${articleId}/${commentId}/upvote`,
        {},
        { withCredentials: true }
      );
      fetchComments();
    } catch (error) {
      console.error("Failed to upvote comment:", error);
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.comment);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      await axios.patch(
        `http://localhost:4000/api/comments/${articleId}/${commentId}`,
        { commentText: editText },
        { withCredentials: true }
      );
      
      setEditingCommentId(null);
      setEditText("");
      fetchComments();
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axios.delete(
        `http://localhost:4000/api/comments/${articleId}/${commentId}`,
        { withCredentials: true }
      );
      fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = (now - commentDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "popular":
        return (b.upvotes || 0) - (a.upvotes || 0);
      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading comments...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                autoResize(e);
              }}
              className="w-full min-h-[80px] px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-muted-foreground"
              placeholder="Share your thoughts..."
              rows="3"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting || newComment.length > 500}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments Header */}
      {comments.length > 0 && (
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h4>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No comments yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment._id} className="flex space-x-3 p-4 bg-card/30 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.user?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="p-1 rounded hover:bg-accent transition-colors"
                      title="Edit comment"
                    >
                      <Edit3 className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1 rounded hover:bg-accent transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      rows="2"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="btn-primary-sm flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-ghost-sm flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{comment.comment}</p>
                )}

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpvote(comment._id)}
                    className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <ThumbsUp className="h-3 w-3 group-hover:text-primary transition-colors" />
                    <span>{comment.upvotes || 0}</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Flag className="h-3 w-3" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
