import React, { useState } from 'react';
import { Button, Box, Typography, IconButton, Grid, LinearProgress } from '@mui/material';
import { Upload, X, FileImage, Cloud } from 'lucide-react';
import { cloudService } from '../services/cloudService';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5, folder = 'images' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload to Firebase Storage
      const uploadResults = await cloudService.uploadImages(files, folder);
      
      if (uploadResults.successful.length > 0) {
        const newImages = uploadResults.successful.map(result => ({
          id: Date.now() + Math.random(),
          url: result.url,
          path: result.path,
          name: result.name,
          size: result.size,
          type: result.type,
          uploadedAt: new Date().toISOString(),
          isCloudStored: true
        }));
        
        onImagesChange([...images, ...newImages]);
      }

      if (uploadResults.failed.length > 0) {
        alert(`Failed to upload ${uploadResults.failed.length} images`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images to cloud storage');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    
    if (imageToRemove) {
      // Delete from cloud storage if it's stored there
      if (imageToRemove.isCloudStored && imageToRemove.path) {
        try {
          await cloudService.deleteImage(imageToRemove.path);
        } catch (error) {
          console.error('Failed to delete image from cloud:', error);
        }
      }
      
      // Remove from local state
      onImagesChange(images.filter(img => img.id !== imageId));
    }
  };

  return (
    <Box className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography variant="subtitle2" className="font-medium">
            Upload Images ({images.length}/{maxImages})
          </Typography>
          <Cloud size={16} className="text-blue-500" />
        </div>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Upload size={16} />}
          disabled={uploading || images.length >= maxImages}
          size="small"
        >
          {uploading ? 'Uploading...' : 'Add Images'}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
      </div>

      {uploading && (
        <Box className="w-full">
          <LinearProgress variant="indeterminate" />
          <Typography variant="caption" className="text-center block mt-1">
            Uploading to cloud storage...
          </Typography>
        </Box>
      )}

      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={6} sm={4} key={image.id}>
              <Box className="relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                  style={{ width: 24, height: 24 }}
                >
                  <X size={14} />
                </IconButton>
                {image.isCloudStored && (
                  <Cloud 
                    size={12} 
                    className="absolute top-1 left-1 text-blue-500 bg-white rounded p-0.5" 
                  />
                )}
                <Typography variant="caption" className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
                  {image.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {images.length === 0 && (
        <Box className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileImage className="mx-auto text-gray-400 mb-2" size={48} />
          <Typography variant="body2" className="text-gray-500">
            No images uploaded yet
          </Typography>
          <Typography variant="caption" className="text-gray-400">
            Images will be stored securely in the cloud
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
