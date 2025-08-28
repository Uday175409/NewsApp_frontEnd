import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { ReplyIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

const CommentsSectionModal = ({ articleId, user }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [sortOrder, setSortOrder] = useState('top'); // 'top' or 'recent'
  // Create a map for easy lookup when rendering comments with replies
  const [commentsMap, setCommentsMap] = useState({});
  
  const dispatch = useDispatch();
  const { theme } = useTheme();

  useEffect(() => {
    if (articleId) {
      console.log('📝 Fetching comments for article:', articleId);
      fetchComments();
    } else {
      console.log('❌ No article ID provided for comments');
    }
  }, [articleId, sortOrder]);

  const fetchComments = async () => {
    if (!articleId) return;
    
    setCommentsLoading(true);
    try {
      console.log('🔍 Fetching comments with sort:', sortOrder);
      const response = await axios.get(`http://localhost:4000/api/comments/${articleId}?sort=${sortOrder}`);
      console.log('📝 Fetched comments:', response.data);
      
      const commentsData = response.data.comments || [];
      
      // Create a map of all comments by ID for easy reference
      const newCommentsMap = {};
      commentsData.forEach(comment => {
        newCommentsMap[comment._id] = comment;
      });
      setCommentsMap(newCommentsMap);
      
      // Get only top-level comments (those with no parentId)
      // A top-level comment is one that doesn't have a parentId (not a reply)
      const topLevelComments = commentsData.filter(comment => !comment.parentId);
      setComments(topLevelComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to load comments'
      }));
      setComments([]);
      setCommentsMap({});
    } finally {
      setCommentsLoading(false);
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
      setIsAddingComment(true);
      
      console.log('📝 Posting comment:', {
        articleId,
        commentText: newComment,
        parentId: null
      });
      
      const response = await axios.post(`http://localhost:4000/api/comments/${articleId}`, {
        commentText: newComment,
        parentId: null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      console.log('✅ Comment posted successfully:', response.data);
      
      dispatch(addToast({
        type: 'success',
        message: 'Comment posted successfully'
      }));
      
      setNewComment('');
      
      // Small delay to ensure DB consistency
      setTimeout(() => {
        fetchComments();
      }, 500);
    } catch (error) {
      console.error("Error posting comment:", error);
      
      const errorMessage = error.response?.data?.error || 'Failed to post comment';
      
      dispatch(addToast({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setIsAddingComment(false);
    }
  };
  
  const handleCommentDeleted = (commentId, shouldRefresh = true) => {
    if (shouldRefresh) {
      // Refresh all comments
      fetchComments();
    } else if (commentId) {
      // Remove the deleted comment from local state
      setComments(prevComments => prevComments.filter(c => c._id !== commentId));
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'top' ? 'recent' : 'top');
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{ 
          margin: 0,
          color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
          fontWeight: '600',
        }}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </h4>
        
        <button
          onClick={toggleSortOrder}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: theme === 'dark' ? '#2d3748' : '#f3f4f6',
            color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Sort by: {sortOrder === 'top' ? 'Top' : 'Recent'}
        </button>
      </div>
      
      {user && (
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
              backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
              color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
              resize: 'vertical',
              minHeight: '80px',
              marginBottom: '12px',
              fontSize: '14px',
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAddComment}
              disabled={isAddingComment || !newComment.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3182ce',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: isAddingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isAddingComment || !newComment.trim() ? 0.7 : 1,
              }}
            >
              {isAddingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}
      
      {commentsLoading ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: theme === 'dark' ? '#a0aec0' : '#718096'
        }}>
          <div style={{
            border: '3px solid #eaeaea',
            borderTop: '3px solid #3182ce',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            marginBottom: '8px',
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ margin: 0 }}>Loading comments...</p>
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <div style={{ 
              padding: '30px', 
              textAlign: 'center',
              backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
              borderRadius: '8px',
              color: theme === 'dark' ? '#a0aec0' : '#718096'
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
                No comments yet. Be the first to comment!
              </p>
              {!user && (
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Please log in to leave a comment.
                </p>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {comments.map(comment => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  articleId={articleId}
                  user={user}
                  onCommentDeleted={handleCommentDeleted}
                  commentsMap={commentsMap}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Comment component
const CommentCard = ({ comment, articleId, user, onCommentDeleted, commentsMap }) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  // Default to showing replies if there are only a few, otherwise collapsed
  const [repliesVisible, setRepliesVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Get all replies for this comment by finding comments where parentId matches current comment's id
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const foundReplies = Object.values(commentsMap)
      .filter(replyComment => replyComment.parentId === comment._id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setReplies(foundReplies);
    
    console.log(`Found ${foundReplies.length} replies for comment ${comment._id}:`, foundReplies);
    
    // Show replies automatically if there are only a few
    if (foundReplies.length > 0 && foundReplies.length <= 3) {
      setRepliesVisible(true);
      console.log(`Auto-showing ${foundReplies.length} replies for comment ${comment._id}`);
    }
  }, [commentsMap, comment._id]);

  const handleReply = async () => {
    if (!replyText.trim()) {
      dispatch(addToast({
        type: 'error',
        message: 'Please enter a reply'
      }));
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(`http://localhost:4000/api/comments/${articleId}`, {
        commentText: replyText,
        parentId: comment._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log("Reply response:", response.data);
      dispatch(addToast({
        type: 'success',
        message: 'Reply posted successfully'
      }));
      setReplyText('');
      setShowReplyForm(false);
      // Fetch all comments to update the view with the new reply
      if (onCommentDeleted) {
        onCommentDeleted(null, true);
      }
      // Always show replies after posting
      setRepliesVisible(true);
    } catch (error) {
      console.error("Error posting reply:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to post reply'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditText(comment.comment);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText('');
  };

  const handleEditSave = async () => {
    if (!editText.trim()) {
      dispatch(addToast({
        type: 'error',
        message: 'Comment cannot be empty'
      }));
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await axios.put(`http://localhost:4000/api/comments/${articleId}/${comment._id}`, {
        commentText: editText
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      console.log("Edit response:", response.data);
      dispatch(addToast({
        type: 'success',
        message: 'Comment updated successfully'
      }));
      
      // Update the comment locally
      if (response.data.comment) {
        comment.comment = response.data.comment.comment;
        comment.updatedAt = response.data.comment.updatedAt;
      } else {
        comment.comment = editText;
        comment.updatedAt = new Date();
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to update comment'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await axios.delete(`http://localhost:4000/api/comments/${articleId}/${comment._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      
      console.log("Delete response:", response.data);
      dispatch(addToast({
        type: 'success',
        message: 'Comment deleted successfully'
      }));
      
      // Notify parent component that comment was deleted for UI update
      if (onCommentDeleted) {
        onCommentDeleted(comment._id);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to delete comment'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    
    return date.toLocaleDateString();
  };

  const toggleReplies = () => {
    const newVisibleState = !repliesVisible;
    setRepliesVisible(newVisibleState);
    console.log(`🔄 Toggle replies for comment ${comment._id}: ${newVisibleState ? 'SHOWING' : 'HIDING'} ${replies.length} replies`);
    console.log('📋 Replies data:', replies);
    
    // Force re-render by updating a state value
    if (newVisibleState) {
      setTimeout(() => {
        console.log("✅ Replies should be visible now. Current state:", {
          repliesVisible: newVisibleState,
          repliesCount: replies.length,
          replies: replies
        });
      }, 100);
    }
  };

  // Check if this comment has any replies
  const hasReplies = replies && replies.length > 0;
  // Debug log the replies
  useEffect(() => {
    if (replies && replies.length > 0) {
      console.log(`Comment ${comment._id} has ${replies.length} replies:`, replies);
    }
  }, [replies, comment._id]);
  
  // Check if the logged-in user is the comment owner - fix potential ID comparison issues
  const isCommentOwner = user && (user.id === comment.user._id || user._id === comment.user._id);

  return (
    <div style={{
      marginBottom: '16px',
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: theme === 'dark' ? '#2d3748' : '#f8f9fa',
      border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`,
      boxShadow: theme === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: theme === 'dark' ? '#4a5568' : '#e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {comment.user?.profile?.profilePicture ? (
            <img 
              src={comment.user.profile.profilePicture} 
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {comment.user?.username?.[0] || 'U'}
            </span>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? '#e2e8f0' : '#343a40',
            }}>
              {comment.user?.username || 'Anonymous'}
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: theme === 'dark' ? '#a0aec0' : '#6c757d'
            }}>
              {formatDate(comment.createdAt)}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
            </span>
          </div>
          
          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                  backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                  color: theme === 'dark' ? '#e2e8f0' : '#212529',
                  resize: 'vertical',
                  minHeight: '60px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleEditCancel}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: theme === 'dark' ? '#4a5568' : '#e9ecef',
                    color: theme === 'dark' ? '#e2e8f0' : '#343a40',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3182ce',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {isProcessing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ 
              margin: '0 0 4px 0',
              color: theme === 'dark' ? '#e2e8f0' : '#343a40',
              fontSize: '14px',
              lineHeight: '1.4',
              wordBreak: 'break-word'
            }}>
              <span style={{ 
                fontWeight: 'bold', 
                color: theme === 'dark' ? '#e2e8f0' : '#343a40',
                marginRight: '8px',
                display: 'none', // Hide username here since it's shown above
              }}>
                {comment.user?.username || 'Anonymous'}
              </span>
              {comment.comment}
            </p>
          )}
          
          {!isEditing && (
            <>
              {/* Instagram-style comment actions (Reply, Edit, Delete) */}
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                marginTop: '4px',
                fontSize: '12px',
              }}>
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    color: theme === 'dark' ? '#a0aec0' : '#718096',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Reply
                </button>
                
                {isCommentOwner && (
                  <>
                    <button
                      onClick={handleEditStart}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        color: theme === 'dark' ? '#a0aec0' : '#718096',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        color: theme === 'dark' ? '#fc8181' : '#e53e3e',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
              
              {/* Instagram-style View replies button */}
              {hasReplies && (
                <div style={{
                  marginTop: '8px',
                  paddingLeft: '0px',
                  borderLeft: `2px solid ${theme === 'dark' ? '#3f4c6b' : '#e2e8f0'}`,
                  paddingTop: '4px',
                  paddingBottom: '4px',
                }}>
                  <button
                    onClick={toggleReplies}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 8px',
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'block',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {repliesVisible ? 'Hide replies' : `View all ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                  </button>
                </div>
              )}
            </>
          )}
          
          {showReplyForm && (
            <div style={{ 
              marginTop: '10px',
              position: 'relative',
              paddingLeft: '40px',
            }}>
              {/* Thread connector line to indicate reply relationship */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '0',
                height: '15px',
                width: '1.5px',
                backgroundColor: theme === 'dark' ? '#4a5568' : '#dee2e6',
              }}></div>
              
              {/* Thread connector to reply box */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '15px',
                height: '1.5px',
                width: '20px',
                backgroundColor: theme === 'dark' ? '#4a5568' : '#dee2e6',
              }}></div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme === 'dark' ? '#1a202c' : '#f1f3f5',
                borderRadius: '18px',
                padding: '6px 10px',
                marginBottom: '8px',
              }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user?.username || 'Anonymous'}...`}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#e2e8f0' : '#212529',
                    outline: 'none',
                    fontSize: '14px',
                    padding: '4px',
                  }}
                />
                <button
                  onClick={handleReply}
                  disabled={isProcessing || !replyText.trim()}
                  style={{
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? 
                      (replyText.trim() ? '#90cdf4' : '#4a5568') :
                      (replyText.trim() ? '#3182ce' : '#a0aec0'),
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isProcessing || !replyText.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '0 8px',
                  }}
                >
                  {isProcessing ? 'Posting...' : 'Post'}
                </button>
              </div>
              <button
                onClick={() => setShowReplyForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  color: theme === 'dark' ? '#a0aec0' : '#718096',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {hasReplies && repliesVisible && (
            <div style={{
              marginTop: '8px',
              marginLeft: '20px',
              borderLeft: `1px solid ${theme === 'dark' ? '#3f4c6b' : '#e2e8f0'}`,
              paddingLeft: '12px',
              display: 'block', /* Ensure this is visible */
            }}>
              {/* Debug info for replies visibility */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ fontSize: '10px', color: 'orange', marginBottom: '4px' }}>
                  DEBUG: Showing {replies.length} replies, visible: {repliesVisible.toString()}
                </div>
              )}
              
              {/* Instagram-style replies */}
              {replies.map((reply) => (
                <div key={reply._id || Math.random()} style={{
                  marginBottom: '12px',
                  position: 'relative',
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: theme === 'dark' ? '#4a5568' : '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: `1px solid ${theme === 'dark' ? '#2d3748' : '#ffffff'}`,
                      flexShrink: 0,
                    }}>
                      {reply.user?.profile?.profilePicture ? (
                        <img 
                          src={reply.user.profile.profilePicture} 
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                          {reply.user?.username?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        margin: '0 0 2px 0',
                        color: theme === 'dark' ? '#e2e8f0' : '#343a40',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        wordBreak: 'break-word'
                      }}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: theme === 'dark' ? '#e2e8f0' : '#343a40',
                          marginRight: '6px'
                        }}>
                          {reply.user?.username || 'Anonymous'}
                        </span>
                        {reply.comment}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '11px',
                      }}>
                        <span style={{ 
                          color: theme === 'dark' ? '#a0aec0' : '#6c757d',
                        }}>
                          {formatDate(reply.createdAt)}
                          {reply.updatedAt && reply.updatedAt !== reply.createdAt && ' (edited)'}
                        </span>
                        
                        {user && (user.id === reply.user?._id || user._id === reply.user?._id) && (
                          <>
                            <button
                              onClick={() => {
                                // Would need to add edit/delete functions for replies
                                // For now just show a toast
                                dispatch(addToast({
                                  type: 'info',
                                  message: 'Reply edit feature coming soon'
                                }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '0',
                                color: theme === 'dark' ? '#90cdf4' : '#3182ce',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            
                            <button
                              onClick={() => {
                                // Would need to add delete functions for replies
                                // For now just show a toast
                                dispatch(addToast({
                                  type: 'info',
                                  message: 'Reply delete feature coming soon'
                                }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '0',
                                color: theme === 'dark' ? '#fc8181' : '#e53e3e',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsSectionModal;
