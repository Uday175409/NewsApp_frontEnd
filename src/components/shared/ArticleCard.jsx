import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { openArticleModal, addToast } from '../../store/slices/uiSlice';
import { toggleBookmarkAsync, toggleLikeAsync } from '../../store/slices/newsSlice';
import axios from 'axios';
import defaultImage from '../../assets/default.png';

export default function ArticleCard({ article, variant = "default" }) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { bookmarkedArticles, likedArticles } = useSelector((state) => state.news);
  const { user } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleReadMore = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Read More button clicked!');
    console.log('Article:', article);
    console.log('Dispatch:', dispatch);
    
    // Track view when opening modal
    if (user) {
      try {
        await axios.post('http://localhost:4000/api/article/view', {
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
        console.log('View tracked successfully');
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }
    
    // Open modal
    try {
      dispatch(openArticleModal(article));
      console.log('Modal dispatch successful');
    } catch (error) {
      console.error('Modal dispatch failed:', error);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      dispatch(addToast({
        type: 'error',
        title: 'Login Required',
        message: 'Please login to bookmark articles'
      }));
      return;
    }
    
    // Prepare article data for backend
    const articleData = {
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
    };
    
    setLoading(true);
    dispatch(toggleBookmarkAsync(articleData))
      .then((result) => {
        if (result.type.endsWith('/fulfilled')) {
          const isBookmarking = result.payload?.message?.includes('added') || 
                               result.payload?.message?.includes('bookmarked');
          dispatch(addToast({
            type: 'success',
            title: isBookmarking ? 'Article Bookmarked!' : 'Bookmark Removed',
            message: isBookmarking ? 'Article saved to your bookmarks' : 'Article removed from bookmarks'
          }));
        } else {
          dispatch(addToast({
            type: 'error',
            title: 'Bookmark Failed',
            message: 'Failed to update bookmark. Please try again.'
          }));
        }
      })
      .finally(() => setLoading(false));
  };
  
  const handleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      dispatch(addToast({
        type: 'error',
        title: 'Login Required',
        message: 'Please login to like articles'
      }));
      return;
    }
    
    // Prepare article data for backend
    const articleData = {
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
    };
    
    setLoading(true);
    dispatch(toggleLikeAsync(articleData))
      .then((result) => {
        if (result.type.endsWith('/fulfilled')) {
          const isLiking = result.payload?.message?.includes('added') || 
                          result.payload?.message?.includes('liked');
          dispatch(addToast({
            type: 'success',
            title: isLiking ? 'Article Liked!' : 'Like Removed',
            message: isLiking ? 'Thanks for liking this article' : 'Like removed from article'
          }));
        } else {
          dispatch(addToast({
            type: 'error',
            title: 'Like Failed',
            message: 'Failed to update like. Please try again.'
          }));
        }
      })
      .finally(() => setLoading(false));
  };

  // Check if article is bookmarked
  const isBookmarked = bookmarkedArticles.some(
    (bookmarked) => 
      (bookmarked._id && article._id && bookmarked._id === article._id) || 
      bookmarked.title === article.title
  );
  
  // Check if article is liked
  const isLiked = likedArticles && likedArticles.some(
    (liked) => 
      (liked._id && article._id && liked._id === article._id) || 
      liked.title === article.title
  );

  return (
    <div className={`card h-100 shadow-sm article-card fade-in ${theme === 'dark' ? 'bg-dark border-secondary text-light' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
      <div className="position-relative">
        <img
          src={imageError ? defaultImage : (article.image_url || article.urlToImage || defaultImage)}
          className={`card-img-top ${theme === 'dark' ? 'bg-secondary' : ''}`}
          alt={article.title}
          style={{ height: variant === "featured" ? "250px" : "200px", objectFit: 'cover', borderBottom: theme === 'dark' ? '1px solid #444' : undefined }}
          onError={handleImageError}
          onClick={handleReadMore}
        />
        {article.category && (
          <span className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-primary">{article.category}</span>
          </span>
        )}
        {variant === "featured" && (
          <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark">
            <i className="fas fa-star me-1"></i>
            Featured
          </span>
        )}
      </div>
      
      <div className="card-body d-flex flex-column">
        <h5 className={`card-title ${theme === 'dark' ? 'text-light' : ''}`} onClick={handleReadMore} style={{ cursor: 'pointer' }}>
          {truncateText(article.title, variant === "featured" ? 80 : 70)}
        </h5>
        
        <p className={`card-text flex-grow-1 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
          {truncateText(article.description || article.content, variant === "featured" ? 140 : 120)}
        </p>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
              <i className="fas fa-clock me-1"></i>
              {formatDate(article.publishedAt || article.pubDate)}
            </small>
            {(article.source_name || article.source_id) && (
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                <i className="fas fa-newspaper me-1"></i>
                {article.source_name || article.source_id}
              </small>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button 
              className={`btn ${variant === "featured" ? "btn-primary" : "btn-primary"} btn-sm flex-fill`}
              onClick={handleReadMore}
              disabled={loading}
            >
              <i className="fas fa-eye me-1"></i>
              Read More
            </button>

            <button 
              className={`btn ${isLiked ? "btn-danger" : "btn-outline-danger"} btn-sm position-relative`}
              onClick={handleLike}
              title={isLiked ? "Unlike" : "Like"}
              style={{ minWidth: '40px' }}
              disabled={loading}
            >
              <i className={`${isLiked ? "fas fa-heart" : "far fa-heart"}`}></i>
              {isLiked && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '0.6em' }}>
                  ✓
                </span>
              )}
            </button>

            <button 
              className={`btn ${isBookmarked ? "btn-warning" : "btn-outline-warning"} btn-sm position-relative`}
              onClick={handleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              style={{ minWidth: '40px' }}
              disabled={loading}
            >
              <i className={`${isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}`}></i>
              {isBookmarked && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '0.6em' }}>
                  ✓
                </span>
              )}
            </button>
            
            {article.link && (
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fas fa-external-link-alt"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
