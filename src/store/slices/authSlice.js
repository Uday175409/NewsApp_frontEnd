import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("🔄 REDUX LOGIN - Starting login process");
      console.log("📧 Login credentials:", { email });

      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("✅ REDUX LOGIN - API response received");
      console.log("📊 Response data:", response.data);

      if (response.data.success) {
        console.log("🎉 REDUX LOGIN - Login successful");
        console.log("👤 Complete user data:", response.data.user);

        // Store token and complete user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        console.log("💾 REDUX LOGIN - Data stored in localStorage");
        
        // Fetch bookmarks and likes - this will be handled by extraReducers
        
        return {
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        console.log("❌ REDUX LOGIN - Login failed:", response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.error("💥 REDUX LOGIN - Error occurred:", error);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 REDUX FETCH - Starting profile fetch");

      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ REDUX FETCH - No token found");
        return rejectWithValue("No token found");
      }

      console.log("📤 REDUX FETCH - Sending profile request");

      const response = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("✅ REDUX FETCH - Profile response received");
      console.log("📊 Complete profile data:", response.data.user);

      if (response.data.success) {
        const userData = response.data.user;

        // Ensure profile object exists with all fields
        const completeUserData = {
          ...userData,
          profile: {
            bio: userData.profile?.bio || "",
            gender: userData.profile?.gender || "",
            dob: userData.profile?.dob || null,
            profilePicture: userData.profile?.profilePicture || "",
            country: userData.profile?.country || "",
            language: userData.profile?.language || "en",
            ...userData.profile,
          },
        };

        console.log("💾 REDUX FETCH - Storing complete user data");
        localStorage.setItem("user", JSON.stringify(completeUserData));

        return completeUserData;
      } else {
        console.log("❌ REDUX FETCH - Failed to fetch profile");
        return rejectWithValue("Failed to fetch profile");
      }
    } catch (error) {
      console.error("💥 REDUX FETCH - Error occurred:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log("🔄 REDUX UPDATE - Starting profile update");
      console.log("📋 Update data:", profileData);

      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ REDUX UPDATE - No token found");
        return rejectWithValue("No token found");
      }

      console.log("📤 REDUX UPDATE - Sending update request");

      const response = await axios.put(
        `${API_BASE_URL}/user/profile/update`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("✅ REDUX UPDATE - Update response received");
      console.log("📊 Updated user data:", response.data.user);

      if (response.data.success) {
        const userData = response.data.user;

        // Ensure all user data is preserved and updated
        const completeUserData = {
          ...userData,
          profile: {
            bio: userData.profile?.bio || "",
            gender: userData.profile?.gender || "",
            dob: userData.profile?.dob || null,
            profilePicture: userData.profile?.profilePicture || "",
            country: userData.profile?.country || "",
            language: userData.profile?.language || "en",
            ...userData.profile,
          },
        };

        console.log("💾 REDUX UPDATE - Storing updated user data");
        localStorage.setItem("user", JSON.stringify(completeUserData));

        return completeUserData;
      } else {
        console.log("❌ REDUX UPDATE - Update failed:", response.data.message);
        return rejectWithValue(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("💥 REDUX UPDATE - Error occurred:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Async thunk for refreshing token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log("🔄 REDUX REFRESH - Starting token refresh");

      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ REDUX REFRESH - No token found");
        return rejectWithValue("No token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/user/refresh-token`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("✅ REDUX REFRESH - Refresh response received");

      if (response.data.success) {
        console.log("🎉 REDUX REFRESH - Token refreshed successfully");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return {
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        console.log("❌ REDUX REFRESH - Refresh failed");
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.error("💥 REDUX REFRESH - Error occurred:", error);
      // If refresh fails, logout the user
      dispatch({ type: "auth/logout" });
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: (() => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log(
          "🔄 REDUX INIT - Loading user from localStorage:",
          userData
        );

        if (userData) {
          // Ensure complete user data structure
          const completeUserData = {
            _id: userData._id || null,
            username: userData.username || "",
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            isVerified: userData.isVerified || false,
            createdAt: userData.createdAt || null,
            updatedAt: userData.updatedAt || null,
            profile: {
              bio: userData.profile?.bio || "",
              gender: userData.profile?.gender || "",
              dob: userData.profile?.dob || null,
              profilePicture: userData.profile?.profilePicture || "",
              country: userData.profile?.country || "",
              language: userData.profile?.language || "en",
              ...userData.profile,
            },
            // Include any additional fields that might be in userData
            ...userData,
          };

          console.log(
            "✅ REDUX INIT - Complete user data loaded:",
            completeUserData
          );
          return completeUserData;
        }

        console.log("❌ REDUX INIT - No user data found in localStorage");
        return null;
      } catch (error) {
        console.error("💥 REDUX INIT - Error loading user data:", error);
        return null;
      }
    })(),
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
    updateLoading: false,
  },
  reducers: {
    logout: (state) => {
      console.log("🔄 REDUX LOGOUT - Clearing user data");

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.updateLoading = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      console.log("✅ REDUX LOGOUT - User logged out successfully");
    },
    clearError: (state) => {
      console.log("🔄 REDUX CLEAR - Clearing error state");
      state.error = null;
    },
    updateUser: (state, action) => {
      console.log("🔄 REDUX UPDATE USER - Updating user data");
      console.log("📋 Update payload:", action.payload);

      if (state.user) {
        // Merge the new data with existing user data
        state.user = {
          ...state.user,
          ...action.payload,
          profile: {
            ...state.user.profile,
            ...action.payload.profile,
          },
        };

        console.log("💾 REDUX UPDATE USER - Updated user data:", state.user);
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    updateProfilePicture: (state, action) => {
      console.log("🔄 REDUX UPDATE PICTURE - Updating profile picture");
      console.log("🖼️ New picture URL:", action.payload);

      if (state.user) {
        if (!state.user.profile) state.user.profile = {};
        state.user.profile.profilePicture = action.payload;

        console.log("💾 REDUX UPDATE PICTURE - Profile picture updated");
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    setUserData: (state, action) => {
      console.log("🔄 REDUX SET USER - Setting complete user data");
      console.log("👤 Complete user data:", action.payload);

      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem("user", JSON.stringify(action.payload));
      console.log("💾 REDUX SET USER - User data stored");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        console.log("🔄 REDUX LOGIN PENDING - Login in progress");
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ REDUX LOGIN FULFILLED - Login successful");
        console.log("👤 User data from action:", action.payload.user);

        state.loading = false;
        state.error = null;

        // Store complete user data
        const completeUserData = {
          _id: action.payload.user._id,
          username: action.payload.user.username,
          name: action.payload.user.name,
          email: action.payload.user.email,
          phone: action.payload.user.phone || "",
          isVerified: action.payload.user.isVerified,
          createdAt: action.payload.user.createdAt,
          updatedAt: action.payload.user.updatedAt,
          profile: {
            bio: action.payload.user.profile?.bio || "",
            gender: action.payload.user.profile?.gender || "",
            dob: action.payload.user.profile?.dob || null,
            profilePicture: action.payload.user.profile?.profilePicture || "",
            country: action.payload.user.profile?.country || "",
            language: action.payload.user.profile?.language || "en",
            ...action.payload.user.profile,
          },
          // Include any other fields
          ...action.payload.user,
        };

        state.user = completeUserData;
        state.token = action.payload.token;
        state.isAuthenticated = true;

        console.log(
          "💾 REDUX LOGIN FULFILLED - Complete user data stored:",
          completeUserData
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("❌ REDUX LOGIN REJECTED - Login failed");
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Fetch Profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        console.log("🔄 REDUX FETCH PENDING - Fetching profile");
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        console.log("✅ REDUX FETCH FULFILLED - Profile fetched");
        console.log("👤 Fetched user data:", action.payload);

        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        console.log("❌ REDUX FETCH REJECTED - Profile fetch failed");
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile cases
      .addCase(updateUserProfile.pending, (state) => {
        console.log("🔄 REDUX UPDATE PENDING - Updating profile");
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log("✅ REDUX UPDATE FULFILLED - Profile updated");
        console.log("👤 Updated user data:", action.payload);

        state.updateLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        console.log("❌ REDUX UPDATE REJECTED - Profile update failed");
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Refresh Token cases
      .addCase(refreshToken.pending, (state) => {
        console.log("🔄 REDUX REFRESH PENDING - Refreshing token");
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        console.log("✅ REDUX REFRESH FULFILLED - Token refreshed");

        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log("❌ REDUX REFRESH REJECTED - Token refresh failed");

        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  clearError,
  updateUser,
  updateProfilePicture,
  setUserData,
} = authSlice.actions;
export default authSlice.reducer;
