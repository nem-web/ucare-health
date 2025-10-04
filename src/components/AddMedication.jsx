import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from '@mui/material';

const AddMedication = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '',
    taken: false
  });

  const frequencies = ['Daily', 'Twice Daily', 'Weekly', 'As Needed'];

  const handleSubmit = () => {
    if (formData.name.trim() && formData.dosage.trim() && formData.time) {
      onAdd({
        ...formData,
        id: Date.now(),
        nextDue: new Date().toISOString()
      });
      setFormData({ name: '', dosage: '', frequency: 'Daily', time: '', taken: false });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Medication</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Medication Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Dosage"
          value={formData.dosage}
          onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
          fullWidth
          margin="normal"
          placeholder="e.g., 500mg, 1 tablet"
        />

        <TextField
          select
          label="Frequency"
          value={formData.frequency}
          onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
          fullWidth
          margin="normal"
        >
          {frequencies.map((freq) => (
            <MenuItem key={freq} value={freq}>
              {freq}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add Medication</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMedication;
