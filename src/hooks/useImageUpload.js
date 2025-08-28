import { useState, useCallback } from 'react';
import ImageUploadService from '../services/imageUploadService';

/**
 * Custom hook for handling image uploads via backend API
 * @param {Object} defaultOptions - Default upload options
 * @returns {Object} Upload state and functions
 */
export const useCloudinaryUpload = (defaultOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  /**
   * Upload single image
   */
  const uploadSingleImage = useCallback(async (file, options = {}) => {
    const uploadOptions = { ...defaultOptions, ...options };
    
    // Validate image
    const validation = ImageUploadService.validateImage(file, uploadOptions.validation);
    if (!validation.valid) {
      setUploadError(validation.error);
      uploadOptions.onUploadError?.(validation.error);
      return { success: false, error: validation.error };
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          uploadOptions.onUploadProgress?.(newProgress);
          return newProgress;
        });
      }, 200);

      // Upload image
      const result = await ImageUploadService.uploadSingleImage(file, {
        folder: uploadOptions.folder,
        width: uploadOptions.width,
        height: uploadOptions.height,
        crop: uploadOptions.crop
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      uploadOptions.onUploadProgress?.(100);

      if (result.success) {
        const newImage = {
          id: result.data.public_id,
          publicId: result.data.public_id,
          url: result.data.secure_url,
          secureUrl: result.data.secure_url,
          width: result.data.width,
          height: result.data.height,
          format: result.data.format,
          bytes: result.data.bytes,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        };

        setUploadedImages(prev => [...prev, newImage]);
        uploadOptions.onUploadSuccess?.([newImage]);
        
        return { success: true, data: newImage };
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      setUploadError(error.message);
      uploadOptions.onUploadError?.(error.message);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [defaultOptions]);

  /**
   * Upload multiple images
   */
  const uploadMultipleImages = useCallback(async (files, options = {}) => {
    const uploadOptions = { ...defaultOptions, ...options };
    const fileArray = Array.from(files);

    // Validate all images
    for (const file of fileArray) {
      const validation = ImageUploadService.validateImage(file, uploadOptions.validation);
      if (!validation.valid) {
        setUploadError(`${file.name}: ${validation.error}`);
        uploadOptions.onUploadError?.(`${file.name}: ${validation.error}`);
        return { success: false, error: validation.error };
      }
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          uploadOptions.onUploadProgress?.(newProgress);
          return newProgress;
        });
      }, 300);

      // Upload images
      const result = await ImageUploadService.uploadMultipleImages(fileArray, {
        folder: uploadOptions.folder
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      uploadOptions.onUploadProgress?.(100);

      if (result.success && result.data.successful.length > 0) {
        const newImages = result.data.successful.map((imageData, index) => ({
          id: imageData.public_id,
          publicId: imageData.public_id,
          url: imageData.secure_url,
          secureUrl: imageData.secure_url,
          width: imageData.width,
          height: imageData.height,
          format: imageData.format,
          bytes: imageData.bytes,
          originalName: fileArray[index]?.name || 'unknown',
          uploadedAt: new Date().toISOString()
        }));

        setUploadedImages(prev => [...prev, ...newImages]);
        uploadOptions.onUploadSuccess?.(newImages);
        
        return { 
          success: true, 
          data: newImages,
          failed: result.data.failed || []
        };
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      setUploadError(error.message);
      uploadOptions.onUploadError?.(error.message);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [defaultOptions]);

  /**
   * Remove uploaded image
   */
  const removeImage = useCallback(async (publicId) => {
    try {
      await ImageUploadService.deleteImage(publicId);
      setUploadedImages(prev => prev.filter(img => img.publicId !== publicId));
      return { success: true };
    } catch (error) {
      console.error('Remove image error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Clear all uploaded images
   */
  const clearImages = useCallback(() => {
    setUploadedImages([]);
    setUploadError(null);
    setUploadProgress(0);
  }, []);

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  return {
    // State
    uploading,
    uploadProgress,
    uploadError,
    uploadedImages,
    
    // Functions
    uploadSingleImage,
    uploadMultipleImages,
    removeImage,
    clearImages,
    resetUpload,
    
    // Utility
    hasImages: uploadedImages.length > 0,
    imageCount: uploadedImages.length
  };
};
