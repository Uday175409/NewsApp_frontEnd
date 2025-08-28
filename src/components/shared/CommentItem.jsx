import React, { useState } from 'react';

const CommentItem = ({ 
  comment, 
  user, 
  onUpvote, 
  onEdit, 
  onDelete, 
  onReport, 
  onReply,
  level = 0 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment || '');
  const [showReplies, setShowReplies] = useState(true);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(comment._id, editText);
      setIsEditing(false);
    }
  };

  const canEdit = user && comment.user && 
    (comment.user._id === user._id || comment.user.username === user.username);

  return (
    <div style={{
      marginLeft: level > 0 ? '24px' : '0',
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: level > 0 ? '#f8f9fa' : '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      borderLeft: level > 0 ? '3px solid #3b82f6' : '1px solid #e5e7eb'
    }}>
      {/* Comment Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            marginRight: '12px'
          }}>
            {comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ 
              fontWeight: '600', 
              color: '#111827',
              fontSize: '14px'
            }}>
              {comment.user?.username || 'Anonymous User'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280' 
            }}>
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Comment Actions Menu */}
        {user && (
          <div className="dropdown">
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              data-bs-toggle="dropdown"
            >
              ⋯
            </button>
            <ul className="dropdown-menu">
              {canEdit && (
                <>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item text-danger"
                      onClick={() => onDelete(comment._id)}
                    >
                      🗑️ Delete
                    </button>
                  </li>
                </>
              )}
              {!canEdit && (
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => onReport(comment._id)}
                  >
                    🚩 Report
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div style={{ marginBottom: '12px' }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveEdit}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.comment || '');
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ 
          margin: '0 0 12px 0', 
          lineHeight: '1.5', 
          color: '#374151',
          fontSize: '14px'
        }}>
          {comment.comment}
        </p>
      )}

      {/* Comment Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user && (
            <>
              <button
                onClick={() => onUpvote(comment._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid #e5e7eb',
                  color: comment.upvotedBy?.includes(user._id) ? '#10b981' : '#6b7280',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <span style={{ fontSize: '14px' }}>👍</span>
                <span style={{ fontWeight: '500' }}>{comment.upvotes || 0}</span>
              </button>

              <button
                onClick={() => onReply(comment._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px'
                }}
              >
                💬 Reply
              </button>
            </>
          )}
          
          {!user && (
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '14px' }}>👍</span>
              <span style={{ fontWeight: '500' }}>{comment.upvotes || 0}</span>
            </span>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowReplies(!showReplies)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            {showReplies ? '🔽' : '▶️'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          
          {showReplies && (
            <div>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  user={user}
                  onUpvote={onUpvote}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
