import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import ImageUpload from './ImageUpload';

const AddPrescription = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    images: []
  });

  const handleSubmit = () => {
    if (formData.doctorName.trim() && formData.images.length > 0) {
      onAdd({
        ...formData,
        id: Date.now(),
        type: 'prescription'
      });
      setFormData({ 
        doctorName: '', 
        date: new Date().toISOString().split('T')[0], 
        diagnosis: '', 
        notes: '', 
        images: [] 
      });
      onClose();
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Prescription</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Doctor Name"
          value={formData.doctorName}
          onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          fullWidth
          multiline
          rows={2}
          margin="normal"
        />

        <div className="mt-4">
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={5}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.doctorName.trim() || formData.images.length === 0}
        >
          Upload Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPrescription;
