// Cloudinary Configuration
const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY || 'your-api-key',
  apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET || 'your-api-secret',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset'
};

export default cloudinaryConfig;
