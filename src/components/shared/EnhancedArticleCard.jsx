import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openArticleModal } from '../../store/slices/uiSlice';
import { Heart, Eye, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { IconCounter } from '../ui/counter/index.jsx';
import defaultImage from '../../assets/default.png';

export default function EnhancedArticleCard({ article, variant = "default" }) {
  const [imageError, setImageError] = useState(false);
  const [metrics, setMetrics] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0
  });
  const [animating, setAnimating] = useState(false);
  
  const dispatch = useDispatch();
  const { bookmarkedArticles } = useSelector((state) => state.news);
  const { user } = useSelector((state) => state.auth);

  // Simulate real metrics (in real app, these would come from your API)
  const targetMetrics = {
    views: Math.floor(Math.random() * 10000) + 100,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 50) + 1,
    shares: Math.floor(Math.random() * 100) + 5
  };

  // Animate counters when card becomes visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(true);
      const interval = setInterval(() => {
        setMetrics(prev => {
          const newMetrics = {};
          let allComplete = true;
          
          Object.keys(targetMetrics).forEach(key => {
            const current = prev[key] || 0;
            const target = targetMetrics[key];
            
            if (current < target) {
              allComplete = false;
              const increment = Math.max(1, Math.floor((target - current) / 10));
              newMetrics[key] = Math.min(current + increment, target);
            } else {
              newMetrics[key] = target;
            }
          });
          
          if (allComplete) {
            clearInterval(interval);
            setAnimating(false);
          }
          
          return newMetrics;
        });
      }, 100);

      return () => clearInterval(interval);
    }, Math.random() * 1000); // Random delay for staggered animations

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleReadMore = () => {
    dispatch(openArticleModal(article));
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return;
    // Handle like logic here
    setMetrics(prev => ({
      ...prev,
      likes: prev.likes + (Math.random() > 0.5 ? 1 : -1)
    }));
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Handle share logic here
    setMetrics(prev => ({
      ...prev,
      shares: prev.shares + 1
    }));
  };

  const isBookmarked = bookmarkedArticles.some(
    (bookmarked) => bookmarked.title === article.title
  );

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-24 flex-shrink-0">
            <img
              src={imageError ? defaultImage : (article.image || article.urlToImage || defaultImage)}
              alt={article.title || 'News'}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900">
                {article.title}
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                {formatDate(article.pubDate || article.publishedAt)}
              </p>
            </div>
            
            {/* Metrics */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <IconCounter type="views" value={metrics.views} />
                {user && (
                  <IconCounter 
                    type="likes" 
                    value={metrics.likes} 
                    onClick={handleLike}
                  />
                )}
              </div>
              <button
                onClick={handleReadMore}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageError ? defaultImage : (article.image || article.urlToImage || defaultImage)}
          alt={article.title || 'News'}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Bookmark badge */}
        {isBookmarked && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-500 text-white p-1 rounded-full shadow-lg">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {article.source_name || 'News'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(article.pubDate || article.publishedAt)}
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3">
            {truncateText(article.description || article.summary)}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <IconCounter type="views" value={metrics.views} animated />
            
            {user && (
              <>
                <IconCounter 
                  type="likes" 
                  value={metrics.likes} 
                  onClick={handleLike}
                  animated
                />
                <IconCounter type="comments" value={metrics.comments} animated />
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {user && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReadMore}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
          >
            Read Full Article
          </button>
          
          {!user && (
            <div className="text-xs text-gray-500 flex items-center px-2">
              Sign in to interact
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
