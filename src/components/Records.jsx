import React, { useState } from 'react';
import { Card, CardContent, Typography, Tabs, Tab, Chip, Grid, IconButton, Menu, MenuItem } from '@mui/material';
import { Pill, Thermometer, Calendar, FileText, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AddSymptom from './AddSymptom';
import AddAppointment from './AddAppointment';
import AddMedication from './AddMedication';
import AddPrescription from './AddPrescription';

const Records = ({ healthData, onSymptomClick, onAddSymptom, onAddAppointment, onAddMedication, onAddPrescription, onEditItem, onDeleteItem }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { 
    symptoms = [], 
    appointments = [], 
    medications = [], 
    prescriptions = [] 
  } = healthData || {};

  const getSeverityColor = (severity) => {
    if (severity <= 2) return 'bg-green-100 text-green-800';
    if (severity <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleAddClick = () => {
    if (activeTab === 0) setShowAddSymptom(true);
    else if (activeTab === 1) setShowAddAppointment(true);
    else if (activeTab === 2) setShowAddMedication(true);
    else if (activeTab === 3) setShowAddPrescription(true);
  };

  const handleMenuClick = (event, item, type) => {
    event.stopPropagation();
    setSelectedItem({ ...item, type });
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    setEditingItem(selectedItem);
    if (selectedItem.type === 'symptom') setShowAddSymptom(true);
    else if (selectedItem.type === 'appointment') setShowAddAppointment(true);
    else if (selectedItem.type === 'medication') setShowAddMedication(true);
    else if (selectedItem.type === 'prescription') setShowAddPrescription(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteItem(selectedItem.type, selectedItem.id);
    handleMenuClose();
  };

  const SymptomCard = ({ symptom }) => (
    <Card 
      className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSymptomClick(symptom)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium">
            {symptom.type}
          </Typography>
          <div className="flex items-center gap-2">
            <Chip 
              label={`Severity ${symptom.severity}/5`}
              className={`text-xs ${getSeverityColor(symptom.severity)}`}
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuClick(e, symptom, 'symptom')}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </div>
        </div>
        <Typography variant="body2" className="text-gray-600 mb-2">
          {symptom.date} • {symptom.duration}
        </Typography>
        <Typography variant="body2" className="text-gray-700 mb-2">
          {symptom.notes}
        </Typography>
        {symptom.images && symptom.images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {symptom.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt="Symptom"
                className="w-12 h-12 object-cover rounded border"
              />
            ))}
            {symptom.images.length > 3 && (
              <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs">
                +{symptom.images.length - 3}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AppointmentCard = ({ appointment }) => (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium">
            {appointment.type}
          </Typography>
          <div className="flex items-center gap-2">
            <Chip 
              label="Upcoming" 
              className="bg-blue-100 text-blue-800 text-xs"
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuClick(e, appointment, 'appointment')}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </div>
        </div>
        <Typography variant="body2" className="text-gray-600 mb-1">
          {appointment.doctor}
        </Typography>
        <Typography variant="body2" className="text-gray-600 mb-1">
          {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          {appointment.location}
        </Typography>
      </CardContent>
    </Card>
  );

  const MedicationCard = ({ medication }) => (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium">
            {medication.name}
          </Typography>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${medication.taken ? 'bg-green-500' : 'bg-gray-300'}`} />
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuClick(e, medication, 'medication')}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </div>
        </div>
        <Typography variant="body2" className="text-gray-600 mb-1">
          {medication.dosage} • {medication.frequency}
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Next: {medication.time}
        </Typography>
      </CardContent>
    </Card>
  );

  const PrescriptionCard = ({ prescription }) => (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium">
            Dr. {prescription.doctorName}
          </Typography>
          <div className="flex items-center gap-2">
            <Chip 
              label="Prescription" 
              className="bg-purple-100 text-purple-800 text-xs"
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuClick(e, prescription, 'prescription')}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </div>
        </div>
        <Typography variant="body2" className="text-gray-600 mb-1">
          {format(new Date(prescription.date), 'MMM dd, yyyy')}
        </Typography>
        {prescription.diagnosis && (
          <Typography variant="body2" className="text-gray-700 mb-2">
            Diagnosis: {prescription.diagnosis}
          </Typography>
        )}
        {prescription.images && prescription.images.length > 0 && (
          <Grid container spacing={1} className="mt-2">
            {prescription.images.map((image, index) => (
              <Grid item xs={4} key={index}>
                <img
                  src={image.url}
                  alt="Prescription"
                  className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                  onClick={() => window.open(image.url, '_blank')}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  const tabContent = [
    {
      label: 'Symptoms',
      icon: <Thermometer size={20} />,
      content: (
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <SymptomCard key={symptom.id} symptom={symptom} />
          ))}
        </div>
      )
    },
    {
      label: 'Appointments',
      icon: <Calendar size={20} />,
      content: (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )
    },
    {
      label: 'Medications',
      icon: <Pill size={20} />,
      content: (
        <div className="space-y-4">
          {medications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </div>
      )
    },
    {
      label: 'Prescriptions',
      icon: <FileText size={20} />,
      content: (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="pb-20">
      <div className="sticky top-16 bg-white z-10 border-b border-gray-200">
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          className="px-4"
        >
          {tabContent.map((tab, index) => (
            <Tab 
              key={index}
              icon={tab.icon}
              label={tab.label}
              className="min-h-0 py-3"
            />
          ))}
        </Tabs>
      </div>
      
      <div className="p-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="font-bold">
            {tabContent[activeTab].label}
          </Typography>
          <button 
            onClick={handleAddClick}
            className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {tabContent[activeTab].content}
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && selectedItem)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit size={16} className="mr-2" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Trash2 size={16} className="mr-2" />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialogs */}
      <AddSymptom
        open={showAddSymptom}
        onClose={() => {
          setShowAddSymptom(false);
          setEditingItem(null);
        }}
        onAdd={editingItem ? (data) => onEditItem('symptom', editingItem.id, data) : onAddSymptom}
        editData={editingItem?.type === 'symptom' ? editingItem : null}
      />

      <AddAppointment
        open={showAddAppointment}
        onClose={() => {
          setShowAddAppointment(false);
          setEditingItem(null);
        }}
        onAdd={editingItem ? (data) => onEditItem('appointment', editingItem.id, data) : onAddAppointment}
        editData={editingItem?.type === 'appointment' ? editingItem : null}
      />

      <AddMedication
        open={showAddMedication}
        onClose={() => {
          setShowAddMedication(false);
          setEditingItem(null);
        }}
        onAdd={editingItem ? (data) => onEditItem('medication', editingItem.id, data) : onAddMedication}
        editData={editingItem?.type === 'medication' ? editingItem : null}
      />

      <AddPrescription
        open={showAddPrescription}
        onClose={() => {
          setShowAddPrescription(false);
          setEditingItem(null);
        }}
        onAdd={editingItem ? (data) => onEditItem('prescription', editingItem.id, data) : onAddPrescription}
        editData={editingItem?.type === 'prescription' ? editingItem : null}
      />
    </div>
  );
};

export default Records;
