import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookmarks, fetchLikes } from '../store/slices/newsSlice';

/**
 * Custom hook to automatically fetch user's bookmarks and likes when authenticated
 */
const useUserPreferences = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { bookmarkedArticles, likedArticles } = useSelector(state => state.news);

  useEffect(() => {
    // If user is authenticated and we don't have their bookmarks/likes yet
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching preferences...');
      
      // Only fetch if we don't already have them or if they might be outdated
      if (!bookmarkedArticles || bookmarkedArticles.length === 0) {
        console.log('Fetching bookmarks...');
        dispatch(fetchBookmarks());
      }
      
      if (!likedArticles || likedArticles.length === 0) {
        console.log('Fetching likes...');
        dispatch(fetchLikes());
      }
    }
  }, [isAuthenticated, user, dispatch, bookmarkedArticles.length, likedArticles?.length]);
};

export default useUserPreferences;
