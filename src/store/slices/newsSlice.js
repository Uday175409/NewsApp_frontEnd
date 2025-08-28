import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Track ongoing requests to prevent duplicates
let currentFetchRequest = null;
let currentSearchRequest = null;

// Async thunk for fetching articles
export const fetchArticles = createAsyncThunk(
  'news/fetchArticles',
  async ({ category, country, lang, max, q, page, isLoadMore = false }, { rejectWithValue, getState }) => {
    try {
      // Create request signature to identify duplicate requests
      const requestSignature = JSON.stringify({ category, country, lang, max, q, page });
      
      // Cancel previous request if it's the same and not a load more
      if (!isLoadMore && currentFetchRequest && currentFetchRequest.signature === requestSignature) {
        console.log('Preventing duplicate fetch request');
        return rejectWithValue('Duplicate request prevented');
      }

      const params = {
        category,
        country,
        lang,
        max,
        ...(q && { q }),
        ...(page && { page }),
      };

      // Store current request info
      currentFetchRequest = { signature: requestSignature };

      console.log('Making API request with params:', params);
      const response = await axios.get(`${API_BASE_URL}/news`, {
        params,
        withCredentials: true,
      });

      // Clear current request
      currentFetchRequest = null;

      if (response.data.success) {
        return {
          articles: response.data.data.articles || [],
          nextPage: response.data.data.nextPage,
          isLoadMore,
        };
      } else {
        return rejectWithValue('Failed to fetch articles');
      }
    } catch (error) {
      // Clear current request on error
      currentFetchRequest = null;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

// Search articles
export const searchArticles = createAsyncThunk(
  'news/searchArticles',
  async ({ query, category, country, lang, max = 12 }, { rejectWithValue }) => {
    try {
      // Create request signature to identify duplicate requests
      const requestSignature = JSON.stringify({ query, category, country, lang, max });
      
      // Cancel previous request if it's the same
      if (currentSearchRequest && currentSearchRequest.signature === requestSignature) {
        console.log('Preventing duplicate search request');
        return rejectWithValue('Duplicate search request prevented');
      }

      const params = {
        q: query,
        category,
        country,
        lang,
        max,
      };

      // Store current request info
      currentSearchRequest = { signature: requestSignature };

      console.log('Making search API request with params:', params);
      const response = await axios.get(`${API_BASE_URL}/news`, {
        params,
        withCredentials: true,
      });

      // Clear current request
      currentSearchRequest = null;

      if (response.data.success) {
        return {
          articles: response.data.data.articles || [],
          nextPage: response.data.data.nextPage,
        };
      } else {
        return rejectWithValue('No articles found');
      }
    } catch (error) {
      // Clear current request on error
      currentSearchRequest = null;
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

// Async thunk for toggling bookmark
export const toggleBookmarkAsync = createAsyncThunk(
  'news/toggleBookmark',
  async (article, { rejectWithValue }) => {
    try {
      // First, we need to get or create an article ID without marking as viewed
      const viewResponse = await axios.post(`${API_BASE_URL}/article/create`, article, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (!viewResponse.data.success) {
        throw new Error('Failed to process article');
      }

      const articleId = viewResponse.data.articleId;

      // Then toggle bookmark
      const bookmarkResponse = await axios.patch(`${API_BASE_URL}/article/bookmark`, 
        { articleId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (bookmarkResponse.data.success) {
        return {
          article: { ...article, _id: articleId },
          message: bookmarkResponse.data.message,
        };
      } else {
        throw new Error(bookmarkResponse.data.message || 'Failed to toggle bookmark');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Bookmark failed');
    }
  }
);

// Async thunk for toggling like
export const toggleLikeAsync = createAsyncThunk(
  'news/toggleLike',
  async (article, { rejectWithValue }) => {
    try {
      // First, we need to get or create an article ID without marking as viewed
      const viewResponse = await axios.post(`${API_BASE_URL}/article/create`, article, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (!viewResponse.data.success) {
        throw new Error('Failed to process article');
      }

      const articleId = viewResponse.data.articleId;

      // Then toggle like
      const likeResponse = await axios.patch(`${API_BASE_URL}/article/like`, 
        { articleId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (likeResponse.data.success) {
        return {
          article: { ...article, _id: articleId },
          message: likeResponse.data.message,
        };
      } else {
        throw new Error(likeResponse.data.message || 'Failed to toggle like');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Like action failed');
    }
  }
);

// Async thunk for fetching bookmarks from backend
export const fetchBookmarks = createAsyncThunk(
  'news/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/article/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.articles || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch bookmarks');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch bookmarks');
    }
  }
);

// Async thunk for fetching likes from backend
export const fetchLikes = createAsyncThunk(
  'news/fetchLikes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/article/likes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.articles || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch likes');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch likes');
    }
  }
);

// Async thunk for fetching featured articles based on engagement
export const fetchFeaturedArticles = createAsyncThunk(
  'news/fetchFeaturedArticles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/article/featured`, {
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.articles || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch featured articles');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch featured articles');
    }
  }
);

// Helper function to get bookmarks from localStorage
const getBookmarksFromStorage = () => {
  try {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load bookmarks from localStorage:', error);
    return [];
  }
};

// Helper function to get likes from localStorage
const getLikesFromStorage = () => {
  try {
    const saved = localStorage.getItem('likedArticles');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load likes from localStorage:', error);
    return [];
  }
};

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    articles: [],
    featuredArticles: [],
    bookmarkedArticles: getBookmarksFromStorage(),
    likedArticles: getLikesFromStorage(),
    loading: false,
    error: null,
    filters: {
      category: 'top',
      country: 'in',
      language: 'en',
      searchQuery: '',
    },
    pagination: {
      currentPage: null,
      nextPage: null,
      hasMore: false,
    },
    selectedArticle: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedArticle: (state, action) => {
      state.selectedArticle = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
    },
    clearArticles: (state) => {
      state.articles = [];
      state.pagination.currentPage = null;
      state.pagination.nextPage = null;
      state.pagination.hasMore = false;
    },
    setFeaturedArticles: (state, action) => {
      state.featuredArticles = action.payload;
    },
    toggleBookmark: (state, action) => {
      const article = action.payload;
      const existingIndex = state.bookmarkedArticles.findIndex(
        (bookmarked) => bookmarked.title === article.title
      );
      
      if (existingIndex >= 0) {
        // Remove bookmark
        state.bookmarkedArticles.splice(existingIndex, 1);
        console.log('Bookmark removed for:', article.title);
      } else {
        // Add bookmark
        const bookmarkedArticle = {
          ...article,
          bookmarkedAt: new Date().toISOString(),
        };
        state.bookmarkedArticles.push(bookmarkedArticle);
        console.log('Bookmark added for:', article.title);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('bookmarkedArticles', JSON.stringify(state.bookmarkedArticles));
      } catch (error) {
        console.error('Failed to save bookmarks to localStorage:', error);
      }
    },
    toggleLike: (state, action) => {
      const article = action.payload;
      const existingIndex = state.likedArticles.findIndex(
        (liked) => liked.title === article.title
      );
      
      if (existingIndex >= 0) {
        // Remove like
        state.likedArticles.splice(existingIndex, 1);
        console.log('Like removed for:', article.title);
      } else {
        // Add like
        const likedArticle = {
          ...article,
          likedAt: new Date().toISOString(),
        };
        state.likedArticles.push(likedArticle);
        console.log('Like added for:', article.title);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('likedArticles', JSON.stringify(state.likedArticles));
      } catch (error) {
        console.error('Failed to save likes to localStorage:', error);
      }
    },
    clearBookmarks: (state) => {
      state.bookmarkedArticles = [];
      // Clear from localStorage
      try {
        localStorage.removeItem('bookmarkedArticles');
      } catch (error) {
        console.error('Failed to clear bookmarks from localStorage:', error);
      }
    },
    clearLikes: (state) => {
      state.likedArticles = [];
      // Clear from localStorage
      try {
        localStorage.removeItem('likedArticles');
      } catch (error) {
        console.error('Failed to clear likes from localStorage:', error);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        const { articles, nextPage, isLoadMore } = action.payload;

        if (isLoadMore) {
          // Append articles for load more
          state.articles = [...state.articles, ...articles];
        } else {
          // Replace articles for new search/filter
          state.articles = articles;
          // Only set featuredArticles from latest news if trending is empty
          if (
            state.filters.category === 'top' &&
            articles.length >= 3 &&
            (!state.featuredArticles || state.featuredArticles.length === 0)
          ) {
            state.featuredArticles = articles.slice(0, 3);
          }
        }

        state.pagination.nextPage = nextPage;
        state.pagination.hasMore = !!nextPage;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Articles
      .addCase(searchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.loading = false;
        const { articles, nextPage } = action.payload;
        state.articles = articles;
        state.featuredArticles = []; // No featured articles for search
        state.pagination.nextPage = nextPage;
        state.pagination.hasMore = !!nextPage;
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Bookmark
      .addCase(toggleBookmarkAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookmarkAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { article } = action.payload;
        
        // Check if article is already bookmarked
        const existingIndex = state.bookmarkedArticles.findIndex(
          (bookmarked) => bookmarked._id === article._id || bookmarked.title === article.title
        );
        
        if (existingIndex >= 0) {
          // Remove bookmark
          state.bookmarkedArticles.splice(existingIndex, 1);
        } else {
          // Add bookmark
          state.bookmarkedArticles.push({
            ...article,
            bookmarkedAt: new Date().toISOString(),
          });
        }
      })
      .addCase(toggleBookmarkAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarkedArticles = action.payload.map(article => ({
          ...article,
          bookmarkedAt: article.updatedAt || new Date().toISOString(),
        }));
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Like
      .addCase(toggleLikeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { article } = action.payload;
        
        // Check if article is already liked
        const existingIndex = state.likedArticles.findIndex(
          (liked) => liked._id === article._id || liked.title === article.title
        );
        
        if (existingIndex >= 0) {
          // Remove like
          state.likedArticles.splice(existingIndex, 1);
        } else {
          // Add like
          state.likedArticles.push({
            ...article,
            likedAt: new Date().toISOString(),
          });
        }
      })
      .addCase(toggleLikeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Likes
      .addCase(fetchLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.likedArticles = action.payload.map(article => ({
          ...article,
          likedAt: article.updatedAt || new Date().toISOString(),
        }));
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured Articles
      .addCase(fetchFeaturedArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredArticles = action.payload;
      })
      .addCase(fetchFeaturedArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setSelectedArticle,
  clearError,
  setSearchQuery,
  clearArticles,
  setFeaturedArticles,
  toggleBookmark,
  toggleLike,
  clearBookmarks,
  clearLikes,
} = newsSlice.actions;

export default newsSlice.reducer;
