import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommentItem from './CommentItem';
import { addToast } from '../../store/slices/uiSlice';
import { uploadService } from '../../services/imageUploadService';

const CommentsSection = ({ articleId, user }) => {
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [articleId, sortBy]);

  const fetchComments = async () => {
    if (!articleId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}?sort=${sortBy}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle the different response structure from the backend
        if (data.success && data.comments) {
          setComments(data.comments);
        } else if (Array.isArray(data)) {
          setComments(data);
        } else {
          setComments([]);
        }
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to load comments'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      dispatch(addToast({
        type: 'error',
        message: 'Please write a comment before posting'
      }));
      return;
    }

    if (!user) {
      dispatch(addToast({
        type: 'error',
        message: 'Please login to comment'
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: newComment })
      });

      if (response.ok) {
        const result = await response.json();
        setNewComment('');
        fetchComments(); // Refresh comments
        dispatch(addToast({
          type: 'success',
          message: 'Comment added successfully!'
        }));
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to add comment'
      }));
    }
  };

  const handleUpvoteComment = async (commentId) => {
    if (!user) {
      dispatch(addToast({
        type: 'error',
        message: 'Please login to upvote comments'
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}/${commentId}/upvote`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments(); // Refresh comments to show updated upvote count
      } else {
        throw new Error('Failed to upvote comment');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to upvote comment'
      }));
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: newText })
      });

      if (response.ok) {
        fetchComments(); // Refresh comments
        dispatch(addToast({
          type: 'success',
          message: 'Comment updated successfully!'
        }));
      } else {
        throw new Error('Failed to edit comment');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to edit comment'
      }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments(); // Refresh comments
        dispatch(addToast({
          type: 'success',
          message: 'Comment deleted successfully!'
        }));
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to delete comment'
      }));
    }
  };

  const handleReportComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to report this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/${articleId}/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'inappropriate_content' })
      });

      if (response.ok) {
        dispatch(addToast({
          type: 'success',
          message: 'Comment reported successfully!'
        }));
      } else {
        throw new Error('Failed to report comment');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to report comment'
      }));
    }
  };

  const handleReplyToComment = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      dispatch(addToast({
        type: 'error',
        message: 'Please write a reply before posting'
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/comment/reply/${replyingTo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: replyText })
      });

      if (response.ok) {
        fetchComments(); // Refresh comments to show new reply
        setReplyingTo(null);
        setReplyText('');
        dispatch(addToast({
          type: 'success',
          message: 'Reply added successfully!'
        }));
      } else {
        throw new Error('Failed to add reply');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to add reply'
      }));
    }
  };

  return (
    <div style={{ margin: '24px 0' }}>
      {/* Comments Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h5 style={{ 
          margin: 0, 
          color: '#111827',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Comments ({comments.length})
        </h5>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostLiked">Most Liked</option>
        </select>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this article..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              backgroundColor: 'white'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Posting as {user.username}
            </span>
            <button
              onClick={handleAddComment}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ 
            margin: '0 0 16px 0', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Please login to join the discussion
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Login to Comment
          </button>
        </div>
      )}

      {/* Reply Form */}
      {replyingTo && (
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #dbeafe'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>
              Replying to comment
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddReply}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Post Reply
            </button>
            <button
              onClick={() => setReplyingTo(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
          <p style={{ marginTop: '16px', marginBottom: 0 }}>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h6 style={{ margin: '0 0 8px 0', color: '#374151' }}>No comments yet</h6>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Be the first to share your thoughts on this article!
          </p>
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              user={user}
              onUpvote={handleUpvoteComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
              onReply={handleReplyToComment}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
