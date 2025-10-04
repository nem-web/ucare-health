import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Slider, Typography } from '@mui/material';
import ImageUpload from './ImageUpload';

const AddSymptom = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: '',
    severity: 1,
    duration: '',
    notes: '',
    images: []
  });

  const handleSubmit = () => {
    if (formData.type.trim()) {
      onAdd({
        ...formData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });
      setFormData({ type: '', severity: 1, duration: '', notes: '', images: [] });
      onClose();
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Symptom</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Symptom Type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          fullWidth
          margin="normal"
        />
        
        <div className="mt-4">
          <Typography gutterBottom>Severity Level: {formData.severity}/5</Typography>
          <Slider
            value={formData.severity}
            onChange={(e, value) => setFormData(prev => ({ ...prev, severity: value }))}
            min={1}
            max={5}
            step={1}
            marks
          />
        </div>

        <TextField
          label="Duration"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
          fullWidth
          margin="normal"
          placeholder="e.g., 2 hours, All day"
        />

        <TextField
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />

        <div className="mt-4">
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={3}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add Symptom</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSymptom;
