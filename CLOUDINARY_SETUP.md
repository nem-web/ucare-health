# Cloudinary Setup for Image Upload

## 1. Create Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Note your Cloud Name, API Key, and API Secret

## 2. Configure Upload Preset
1. Go to Settings > Upload in your Cloudinary dashboard
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. Set preset name: `ucare_health`
5. Set signing mode to "Unsigned"
6. Configure folder: `ucare-health-records`
7. Set allowed formats: `jpg,png,jpeg,pdf`
8. Set max file size: `10MB`
9. Save the preset

## 3. Update ImageUpload Component
Replace the placeholders in `/src/components/ImageUpload.jsx`:

```javascript
// Replace these lines:
formData.append('upload_preset', 'ucare_health'); 
formData.append('cloud_name', 'your_cloud_name'); 

// With your actual values:
formData.append('upload_preset', 'ucare_health'); 
formData.append('cloud_name', 'YOUR_ACTUAL_CLOUD_NAME'); 

// Update the fetch URL:
const response = await fetch(
  'https://api.cloudinary.com/v1_1/YOUR_ACTUAL_CLOUD_NAME/image/upload',
```

## 4. Environment Variables (Optional)
Create `.env` file in project root:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ucare_health
```

Then update ImageUpload.jsx to use:
```javascript
formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
```

## 5. Features Enabled
- ✅ Upload images for symptoms, prescriptions
- ✅ Cloud storage accessible from anywhere
- ✅ Automatic image optimization
- ✅ Secure URLs with CDN delivery
- ✅ Fallback to local storage for demo

## 6. Alternative Cloud Storage
If you prefer other services:
- **AWS S3**: Use AWS SDK for JavaScript
- **Firebase Storage**: Use Firebase SDK
- **Supabase Storage**: Use Supabase client

The ImageUpload component is designed to work with any cloud storage by modifying the `uploadToCloudinary` function.
