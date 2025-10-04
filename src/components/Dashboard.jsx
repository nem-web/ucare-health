import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Heart, Activity, Moon, Apple, Check } from 'lucide-react';
import HealthMetrics from './HealthMetrics';
import WaterReminder from './WaterReminder';

const Dashboard = ({ healthData, onSymptomClick, onMedicationTaken, onUpdateMetrics, onUpdateWaterSettings, onLogWater }) => {
  const { phi, medications } = healthData;
  
  const chartData = phi.trend.map((value, index) => ({
    day: `Day ${index + 1}`,
    phi: value
  }));

  const categories = [
    { key: 'physical', label: 'Physical', icon: Heart, color: 'text-red-500' },
    { key: 'mental', label: 'Mental', icon: Activity, color: 'text-blue-500' },
    { key: 'sleep', label: 'Sleep', icon: Moon, color: 'text-purple-500' },
    { key: 'nutrition', label: 'Nutrition', icon: Apple, color: 'text-green-500' }
  ];

  const handleMedicationClick = (medicationId) => {
    onMedicationTaken(medicationId);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* PHI Score Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Typography variant="h4" className="font-bold text-primary">
              {phi.current}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Personal Health Index
            </Typography>
          </div>
          
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="phi" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <Typography variant="body2" className="text-center text-gray-600">
            7-day trend showing steady improvement
          </Typography>
        </CardContent>
      </Card>

      {/* Health Categories */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`${color} w-6 h-6`} />
                <Typography variant="h6" className="font-semibold">
                  {phi.categories[key]}
                </Typography>
              </div>
              <Typography variant="body2" className="text-gray-600 mb-2">
                {label}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={phi.categories[key]} 
                className="h-2 rounded"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Water Reminder */}
      <WaterReminder 
        waterSettings={healthData.waterSettings}
        onUpdateSettings={onUpdateWaterSettings}
        onLogWater={onLogWater}
        healthData={healthData}
      />

      {/* Health Metrics Tracking */}
      <HealthMetrics 
        healthData={healthData} 
        onUpdateMetrics={onUpdateMetrics}
      />

      {/* Today's Medications */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Today's Medications
          </Typography>
          <div className="space-y-3">
            {medications.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    {med.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {med.dosage} • {med.frequency}
                  </Typography>
                </div>
                {med.taken ? (
                  <div className="flex items-center text-green-600">
                    <Check size={16} className="mr-1" />
                    <span className="text-sm">Taken</span>
                  </div>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleMedicationClick(med.id)}
                    className="bg-primary"
                  >
                    Mark Taken
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
