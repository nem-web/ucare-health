const STORAGE_KEY = 'ucare_health_data';

export const saveHealthData = (data) => {
  try {
    // Convert blob URLs back to base64 for storage
    const dataToStore = JSON.parse(JSON.stringify(data, (key, value) => {
      if (key === 'images' && Array.isArray(value)) {
        return value.map(img => ({
          ...img,
          url: img.base64 || img.url // Use base64 if available
        }));
      }
      return value;
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const loadHealthData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Restore blob URLs for images
    const processImages = (obj) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map(processImages);
        }
        
        const processed = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'images' && Array.isArray(value)) {
            processed[key] = value.map(img => ({
              ...img,
              url: img.base64 || img.url
            }));
          } else {
            processed[key] = processImages(value);
          }
        }
        return processed;
      }
      return obj;
    };
    
    return processImages(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
};
