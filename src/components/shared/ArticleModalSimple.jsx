import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { toggleBookmark, toggleLike } from '../../store/slices/newsSlice';
import { Heart, Bookmark, BookmarkCheck, Share2, ExternalLink, Calendar, User, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import CommentsSectionModal from './CommentsSectionModal';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import "../css/ArticleModal.css"; // Assuming you have a CSS file for styling

export default function ArticleModal({ article, onClose }) {
  const [loading, setLoading] = useState(false);
  const [articleDbId, setArticleDbId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const { bookmarkedArticles, likedArticles } = useSelector((state) => state.news);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  if (!article) return null;

  useEffect(() => {
    const ensureArticleExists = async () => {
      try {
        setLoading(true);
        const articleResponse = await axios.post(`${API_BASE_URL}/article/create`, {
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
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const dbArticleId = articleResponse.data.articleId;
        setArticleDbId(dbArticleId);

        // Add article to reading history if user is logged in
        if (user && dbArticleId) {
          try {
            console.log('🔍 Adding to reading history - User:', user.id, 'ArticleId:', dbArticleId);
            const historyResponse = await axios.post(`${API_BASE_URL}/user/reading-history/${dbArticleId}`, {}, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              withCredentials: true,
            });
            console.log('✅ Successfully added to reading history:', historyResponse.data);
          } catch (historyError) {
            console.error('❌ Error adding to reading history:', historyError.response?.data || historyError.message);
            // Don't show error to user, it's not critical
          }
        } else {
          console.log('⚠️ Skipping reading history - User:', !!user, 'ArticleId:', dbArticleId);
        }
      } catch (error) {
        console.error('Error ensuring article exists:', error);
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load article data'
        }));
      } finally {
        setLoading(false);
      }
    };

    ensureArticleExists();
  }, [article.title, article.link, user]);

  // Check if article is liked/bookmarked
  useEffect(() => {
    if (article) {
      const isArticleLiked = likedArticles.some(liked => liked.title === article.title);
      const isArticleBookmarked = bookmarkedArticles.some(bookmarked => bookmarked.title === article.title);
      setIsLiked(isArticleLiked);
      setIsBookmarked(isArticleBookmarked);
    }
  }, [article, likedArticles, bookmarkedArticles]);

  const handleLike = async () => {
    if (isProcessingLike) return;
    
    setIsProcessingLike(true);
    try {
      // Update Redux state
      dispatch(toggleLike(article));
      
      // Also try to update backend if article exists in DB
      if (articleDbId) {
        try {
          await axios.post(
            `${API_BASE_URL}/articles/${articleDbId}/like`,
            {},
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              withCredentials: true
            }
          );
        } catch (error) {
          console.error('Backend like update failed:', error);
          // Don't show error to user, Redux update is enough
        }
      }
      
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: isLiked ? 'Article unliked!' : 'Article liked!'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update like'
      }));
    } finally {
      setIsProcessingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (isProcessingBookmark) return;
    
    setIsProcessingBookmark(true);
    try {
      // Update Redux state
      dispatch(toggleBookmark(article));
      
      // Also try to update backend if article exists in DB
      if (articleDbId) {
        try {
          await axios.post(
            `${API_BASE_URL}/articles/${articleDbId}/bookmark`,
            {},
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              withCredentials: true
            }
          );
        } catch (error) {
          console.error('Backend bookmark update failed:', error);
          // Don't show error to user, Redux update is enough
        }
      }
      
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: isBookmarked ? 'Article removed from bookmarks!' : 'Article bookmarked!'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update bookmark'
      }));
    } finally {
      setIsProcessingBookmark(false);
    }
  };

  const handleShare = () => {
    const url = article.link || article.url;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: 'Article URL copied to clipboard!'
      }));
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme === 'dark' ? '#ffffff' : '#111827',
              lineHeight: '1.3',
              margin: '0 0 12px 0',
            }}>
              {article.title}
            </h2>
            
            {/* Article Meta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              flexWrap: 'wrap'
            }}>
              {article.publishedAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              )}
              {(article.author || article.source_name) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  {article.author || article.source_name}
                </span>
              )}
              {article.source_name && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={article.source_icon} alt="Source Icon" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb', textDecoration: 'underline' }}>
                    {article.source_name}
                  </a>
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Article Image */}
          {(article.image_url || article.urlToImage) && (
            <div style={{ marginBottom: '24px' }}>
              <img
                src={article.image_url || article.urlToImage}
                alt={article.title}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          
          {/* Article Description */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ 
              color: theme === 'dark' ? '#e5e7eb' : '#374151',
              lineHeight: '1.7', 
              fontSize: '16px',
              margin: '0'
            }}>
              {article.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            {user && (
              <>
                <button
                  onClick={handleLike}
                  disabled={isProcessingLike}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isProcessingLike ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: isLiked 
                      ? '#ef4444' 
                      : theme === 'dark' ? '#374151' : '#f3f4f6',
                    color: isLiked 
                      ? '#ffffff' 
                      : theme === 'dark' ? '#e5e7eb' : '#374151',
                    opacity: isProcessingLike ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>

                <button
                  onClick={handleBookmark}
                  disabled={isProcessingBookmark}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isProcessingBookmark ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: isBookmarked 
                      ? '#3b82f6' 
                      : theme === 'dark' ? '#374151' : '#f3f4f6',
                    color: isBookmarked 
                      ? '#ffffff' 
                      : theme === 'dark' ? '#e5e7eb' : '#374151',
                    opacity: isProcessingBookmark ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              </>
            )}

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
                transition: 'all 0.2s'
              }}
            >
              <Share2 size={16} />
              Share
            </button>
            
            {article.link && (
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                <ExternalLink size={16} />
                Read Full Article
              </a>
            )}
          </div>

          {/* Comments Section */}
          <div style={{ 
            borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <CommentsSectionModal articleId={articleDbId} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
