import React, { useRef, useState } from 'react';
import { Upload, X, Image, AlertCircle, Check } from 'lucide-react';
import { useCloudinaryUpload } from '../../hooks/useImageUpload';
import './ImageUpload.css';

const ImageUpload = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 1,
  folder = 'news-app',
  acceptedTypes = 'image/*',
  maxSize = 5, // MB
  className = '',
  placeholder = 'Click to upload or drag and drop',
  showPreview = true,
  circular = false,
  size = 'medium' // small, medium, large
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    uploading,
    uploadProgress,
    uploadError,
    uploadedImages,
    uploadSingleImage,
    removeImage,
    hasImages,
    imageCount
  } = useCloudinaryUpload({
    onUploadSuccess,
    onUploadError,
    folder
  });

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Take first file if multiple selected
    
    // Prepare validation options
    const validationOptions = {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes: acceptedTypes === 'image/*' 
        ? ['image/*'] 
        : acceptedTypes.split(',').map(type => type.trim())
    };
    
    await uploadSingleImage(file, {
      validation: validationOptions,
      folder
    });
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (imageId) => {
    removeImage(imageId, true); // Delete from Cloudinary too
  };

  const canUploadMore = imageCount < maxFiles;

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'upload-small';
      case 'large': return 'upload-large';
      default: return 'upload-medium';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* Upload Area */}
      {(!hasImages || canUploadMore) && (
        <div
          className={`upload-area ${getSizeClass()} ${dragActive ? 'drag-active' : ''} ${circular ? 'circular' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            style={{ display: 'none' }}
            multiple={maxFiles > 1}
          />
          
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-circle">
                <div 
                  className="progress-fill" 
                  style={{ '--progress': `${uploadProgress}%` }}
                ></div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="upload-content">
              <Upload className="upload-icon" />
              <p className="upload-text">{placeholder}</p>
              <p className="upload-hint">Max {maxSize}MB • {acceptedTypes}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && hasImages && (
        <div className="image-previews">
          {uploadedImages.map((image) => (
            <div key={image.id} className={`image-preview ${circular ? 'circular' : ''}`}>
              <img
                src={image.cloudinary.url}
                alt="Uploaded"
                className="preview-image"
              />
              <div className="preview-overlay">
                <button
                  className="remove-button"
                  onClick={() => handleRemoveImage(image.id)}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="upload-success">
                <Check size={16} />
              </div>
              {/* Image Info */}
              <div className="image-info">
                <span className="image-name">{image.file.name}</span>
                <span className="image-size">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Stats */}
      {maxFiles > 1 && (
        <div className="upload-stats">
          <span>{uploadedImages.length} of {maxFiles} images uploaded</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
