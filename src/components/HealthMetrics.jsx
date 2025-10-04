import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Moon, Apple, Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const HealthMetrics = ({ healthData, onUpdateMetrics }) => {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logData, setLogData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleepHours: '',
    sleepQuality: '',
    waterIntake: '',
    calories: '',
    exercise: ''
  });

  const metrics = healthData.metrics || {
    logs: [],
    averages: { sleep: 0, nutrition: 0, exercise: 0 }
  };

  const getAgeBasedTargets = (age) => {
    const userAge = parseInt(age) || 25;
    
    // Age-based sleep targets
    let sleepTarget = 8; // Default for adults
    if (userAge < 18) sleepTarget = 9;
    else if (userAge >= 65) sleepTarget = 7;
    
    // Age-based exercise targets
    let exerciseTarget = 60; // Default moderate activity
    if (userAge < 18) exerciseTarget = 90; // More active for youth
    else if (userAge >= 65) exerciseTarget = 30; // Gentler for seniors
    else if (userAge >= 40) exerciseTarget = 45; // Moderate for middle age
    
    // Age-based calorie targets
    let calorieMin = 1800, calorieMax = 2400;
    if (userAge < 18) { calorieMin = 2000; calorieMax = 2800; }
    else if (userAge >= 65) { calorieMin = 1600; calorieMax = 2000; }
    else if (userAge >= 40) { calorieMin = 1700; calorieMax = 2200; }
    
    return { sleepTarget, exerciseTarget, calorieMin, calorieMax };
  };

  const calculateAverages = (logs) => {
    if (logs.length === 0) return { sleep: 0, nutrition: 0, exercise: 0 };
    
    const userAge = healthData.profile?.age || 25;
    const targets = getAgeBasedTargets(userAge);
    
    const recent = logs.slice(-7); // Last 7 days
    
    const sleep = recent.reduce((sum, log) => {
      const hours = parseFloat(log.sleepHours) || 0;
      return sum + Math.min(100, (hours / targets.sleepTarget) * 100);
    }, 0) / recent.length;
    
    const nutrition = recent.reduce((sum, log) => {
      const water = parseFloat(log.waterIntake) || 0;
      const calories = parseFloat(log.calories) || 0;
      const waterScore = Math.min(50, (water / 2) * 50); // 2L target
      const calorieScore = (calories >= targets.calorieMin && calories <= targets.calorieMax) ? 50 : 25;
      return sum + waterScore + calorieScore;
    }, 0) / recent.length;
    
    const exercise = recent.reduce((sum, log) => {
      const minutes = parseFloat(log.exercise) || 0;
      return sum + Math.min(100, (minutes / targets.exerciseTarget) * 100);
    }, 0) / recent.length;
    
    return {
      sleep: Math.round(sleep),
      nutrition: Math.round(nutrition),
      exercise: Math.round(exercise)
    };
  };

  const handleLogSave = () => {
    const newLog = { ...logData, id: Date.now() };
    const updatedLogs = [newLog, ...metrics.logs];
    const averages = calculateAverages(updatedLogs);
    
    onUpdateMetrics({
      logs: updatedLogs,
      averages
    });
    
    setLogDialogOpen(false);
    setLogData({
      date: format(new Date(), 'yyyy-MM-dd'),
      sleepHours: '',
      sleepQuality: '',
      waterIntake: '',
      calories: '',
      exercise: ''
    });
  };

  const userAge = parseInt(healthData.profile?.age) || 25;
  const targets = getAgeBasedTargets(userAge);

  const getAgeGroup = (age) => {
    if (age < 18) return 'Youth';
    if (age < 40) return 'Adult';
    if (age < 65) return 'Middle Age';
    return 'Senior';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Health Scores */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Typography variant="h6" className="font-semibold">
                Health Metrics
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Targets for {getAgeGroup(userAge)} (Age {userAge})
              </Typography>
            </div>
            <Button
              startIcon={<Plus size={16} />}
              onClick={() => setLogDialogOpen(true)}
              variant="contained"
              size="small"
            >
              Log Today
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Moon className="mx-auto mb-2 text-purple-500" size={24} />
              <Typography variant="h5" className={`font-bold ${getScoreColor(metrics.averages.sleep)}`}>
                {metrics.averages.sleep}%
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Sleep Quality
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.averages.sleep} 
                className="mt-2 h-2 rounded"
              />
            </div>

            <div className="text-center">
              <Apple className="mx-auto mb-2 text-green-500" size={24} />
              <Typography variant="h5" className={`font-bold ${getScoreColor(metrics.averages.nutrition)}`}>
                {metrics.averages.nutrition}%
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Nutrition
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.averages.nutrition} 
                className="mt-2 h-2 rounded"
              />
            </div>

            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 text-blue-500" size={24} />
              <Typography variant="h5" className={`font-bold ${getScoreColor(metrics.averages.exercise)}`}>
                {metrics.averages.exercise}%
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Exercise
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.averages.exercise} 
                className="mt-2 h-2 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Recent Logs
          </Typography>
          {metrics.logs.length > 0 ? (
            <div className="space-y-3">
              {metrics.logs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="font-medium">
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </Typography>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                    <div>Sleep: {log.sleepHours}h</div>
                    <div>Water: {log.waterIntake}L</div>
                    <div>Exercise: {log.exercise}min</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Typography variant="body2" className="text-gray-500 mb-3">
                No health metrics logged yet
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setLogDialogOpen(true)}
                startIcon={<Plus size={16} />}
                size="small"
              >
                Log First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Entry Dialog */}
      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Health Metrics</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              label="Date"
              type="date"
              value={logData.date}
              onChange={(e) => setLogData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Sleep Hours"
              type="number"
              value={logData.sleepHours}
              onChange={(e) => setLogData(prev => ({ ...prev, sleepHours: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, max: 12, step: 0.5 }}
              helperText={`Target: ${targets.sleepTarget}h (${getAgeGroup(userAge)})`}
            />

            <TextField
              label="Water Intake (Liters)"
              type="number"
              value={logData.waterIntake}
              onChange={(e) => setLogData(prev => ({ ...prev, waterIntake: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, max: 5, step: 0.1 }}
              helperText="Target: 2L daily"
            />

            <TextField
              label="Calories"
              type="number"
              value={logData.calories}
              onChange={(e) => setLogData(prev => ({ ...prev, calories: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, max: 5000 }}
              helperText={`Target: ${targets.calorieMin}-${targets.calorieMax} cal (${getAgeGroup(userAge)})`}
            />

            <TextField
              label="Exercise (Minutes)"
              type="number"
              value={logData.exercise}
              onChange={(e) => setLogData(prev => ({ ...prev, exercise: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, max: 300 }}
              helperText={`Target: ${targets.exerciseTarget} min (${getAgeGroup(userAge)})`}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogSave} variant="contained">Save Log</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HealthMetrics;
