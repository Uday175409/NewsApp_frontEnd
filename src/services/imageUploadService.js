// Frontend service for image uploads via backend API
import { API_BASE_URL } from '../config/api';

class ImageUploadService {
  /**
   * Get authentication headers
   */
  static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Upload single image
   * @param {File} file - Image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadSingleImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add optional parameters
      if (options.folder) formData.append('folder', options.folder);
      if (options.width) formData.append('width', options.width);
      if (options.height) formData.append('height', options.height);
      if (options.crop) formData.append('crop', options.crop);

      const token = localStorage.getItem('token');
      console.log('Upload Debug - Token available:', !!token);
      console.log('Upload Debug - Token length:', token ? token.length : 0);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   * @param {FileList|Array} files - Image files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadMultipleImages(files, options = {}) {
    try {
      const formData = new FormData();
      
      // Add files
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      
      // Add optional parameters
      if (options.folder) formData.append('folder', options.folder);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/images/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  /**
   * Delete image
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteImage(publicId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Delete failed');
      }

      return result;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple images
   * @param {Array} publicIds - Array of Cloudinary public IDs
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteMultipleImages(publicIds) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/images/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ publicIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Bulk delete failed');
      }

      return result;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URLs
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Image transformations
   * @returns {Promise<Object>} Optimized URLs
   */
  static async getOptimizedUrls(publicId, transformations = {}) {
    try {
      const params = new URLSearchParams(transformations);
      const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(publicId)}/urls?${params}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get URLs');
      }

      return result;
    } catch (error) {
      console.error('Get URLs error:', error);
      throw error;
    }
  }

  /**
   * Get image details
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Image details
   */
  static async getImageDetails(publicId) {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(publicId)}/details`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get image details');
      }

      return result;
    } catch (error) {
      console.error('Get image details error:', error);
      throw error;
    }
  }

  /**
   * Validate image file on frontend
   * @param {File} file - Image file to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateImage(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    } = options;

    // Handle wildcard image types (e.g., 'image/*')
    let validTypes = allowedTypes;
    if (allowedTypes.includes('image/*')) {
      validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    }

    // Check if file type starts with 'image/' for broader compatibility
    const isImageFile = file.type.startsWith('image/') || validTypes.includes(file.type);
    
    if (!isImageFile) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: image files only`
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default ImageUploadService;
