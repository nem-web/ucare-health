import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const AddAppointment = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: '',
    doctor: '',
    date: '',
    time: '',
    location: ''
  });

  const handleSubmit = () => {
    if (formData.type.trim() && formData.doctor.trim() && formData.date && formData.time) {
      onAdd({
        ...formData,
        id: Date.now()
      });
      setFormData({ type: '', doctor: '', date: '', time: '', location: '' });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Appointment</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Appointment Type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Doctor Name"
          value={formData.doctor}
          onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
          fullWidth
          margin="normal"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </div>

        <TextField
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add Appointment</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointment;
