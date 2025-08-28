import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, updateProfilePicture } from "../store/slices/authSlice";
import ImageUpload from "../components/ui/ImageUpload";

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, updateLoading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    dob: "",
    country: "",
    language: "",
  });

  const [cloudinaryImageUrl, setCloudinaryImageUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.profile?.bio || "",
        gender: user.profile?.gender || "",
        dob: user.profile?.dob ? user.profile.dob.split('T')[0] : "",
        country: user.profile?.country || "",
        language: user.profile?.language || "English",
      });
      
      // Set existing profile picture URL
      if (user.profile?.profilePicture) {
        setCloudinaryImageUrl(user.profile.profilePicture);
      }
    } else {
      // Fetch user profile if not in Redux store
      dispatch(fetchUserProfile());
    }
  }, [user, isAuthenticated, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Cloudinary upload handlers
  const handleImageUploadSuccess = (uploadedImages) => {
    if (uploadedImages.length > 0) {
      const uploadedImage = uploadedImages[0];
      const imageUrl = uploadedImage.secureUrl || uploadedImage.url;
      setCloudinaryImageUrl(imageUrl);
      
      // Update Redux store immediately
      dispatch(updateProfilePicture(imageUrl));
      
      // Clear any file errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }));
    }
  };

  const handleImageUploadError = (error) => {
    setErrors(prev => ({
      ...prev,
      profilePicture: error
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          profilePicture: 'File size must be less than 5MB'
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file'
        }));
        return;
      }

      setForm(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear any file errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSuccess(false);

    try {
      // Prepare data for update
      const updateData = {
        username: form.username,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        gender: form.gender,
        dob: form.dob,
        country: form.country,
        language: form.language,
      };

      // Add Cloudinary image URL if available
      if (cloudinaryImageUrl) {
        updateData.profilePicture = cloudinaryImageUrl;
      }

      // Use Redux action to update profile
      const result = await dispatch(updateUserProfile(updateData));
      
      if (result.type === 'auth/updateUserProfile/fulfilled') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center py-5">
                <i className="fas fa-lock fa-3x text-danger mb-4"></i>
                <h3>Access Denied</h3>
                <p className="text-muted mb-4">Please login to update your profile.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate('/profile')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Profile
          </button>
          <h1 className="display-5 fw-bold">Update Profile</h1>
          <p className="text-muted">Edit your personal information and preferences</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              <div>
                Profile updated successfully! Redirecting to profile page...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>{errors.submit}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Profile Picture Section */}
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-camera me-2"></i>
                  Profile Picture
                </h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Profile Preview" 
                      className="rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <i className="fas fa-user fa-3x text-muted"></i>
                    </div>
                  )}
                </div>
                
                {/* New Cloudinary Image Upload Component */}
                <ImageUpload
                  onUploadSuccess={handleImageUploadSuccess}
                  onUploadError={handleImageUploadError}
                  maxFiles={1}
                  folder="profile-pictures"
                  size="small"
                  variant="circular"
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                  maxSizeBytes={5 * 1024 * 1024} // 5MB
                  placeholder="Upload Profile Picture"
                  showPreview={false} // We handle preview ourselves
                />
                
                {errors.profilePicture && (
                  <div className="text-danger small mt-2">{errors.profilePicture}</div>
                )}
                
                <div className="mt-2">
                  <small className="text-muted">
                    Max size: 5MB. Formats: JPG, PNG, WebP
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-user-edit me-2"></i>
                  Personal Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Username */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-user me-1"></i>
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      value={form.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-envelope me-1"></i>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-phone me-1"></i>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-venus-mars me-1"></i>
                      Gender
                    </label>
                    <select
                      name="gender"
                      className="form-select"
                      value={form.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-calendar me-1"></i>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={form.dob}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Country */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-globe me-1"></i>
                      Country
                    </label>
                    <select
                      name="country"
                      className="form-select"
                      value={form.country}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="India">India</option>
                      <option value="China">China</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Italy">Italy</option>
                      <option value="Spain">Spain</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Austria">Austria</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-language me-1"></i>
                      Language
                    </label>
                    <select
                      name="language"
                      className="form-select"
                      value={form.language}
                      onChange={handleInputChange}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Russian">Russian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Swedish">Swedish</option>
                      <option value="Norwegian">Norwegian</option>
                      <option value="Danish">Danish</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-align-left me-1"></i>
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      className="form-control"
                      rows="3"
                      value={form.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/profile')}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
