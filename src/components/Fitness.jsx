import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { Dumbbell, Target, TrendingUp, Calendar } from 'lucide-react';

const Fitness = ({ healthData, onUpdateFitness }) => {
  const [workoutForm, setWorkoutForm] = useState({
    exercise: '',
    duration: '',
    calories: '',
    notes: ''
  });

  const fitnessData = healthData.fitness || {
    workouts: [],
    goals: {
      weeklyWorkouts: 4,
      weeklyCalories: 2000
    },
    stats: {
      totalWorkouts: 0,
      totalCalories: 0,
      avgDuration: 0
    }
  };

  const handleAddWorkout = () => {
    if (!workoutForm.exercise || !workoutForm.duration) return;

    const newWorkout = {
      id: Date.now(),
      exercise: workoutForm.exercise,
      duration: parseInt(workoutForm.duration),
      calories: parseInt(workoutForm.calories) || 0,
      notes: workoutForm.notes,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedFitness = {
      ...fitnessData,
      workouts: [newWorkout, ...fitnessData.workouts],
      stats: {
        totalWorkouts: fitnessData.stats.totalWorkouts + 1,
        totalCalories: fitnessData.stats.totalCalories + newWorkout.calories,
        avgDuration: Math.round(
          (fitnessData.stats.avgDuration * fitnessData.stats.totalWorkouts + newWorkout.duration) / 
          (fitnessData.stats.totalWorkouts + 1)
        )
      }
    };

    onUpdateFitness(updatedFitness);
    setWorkoutForm({ exercise: '', duration: '', calories: '', notes: '' });
  };

  const thisWeekWorkouts = fitnessData.workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return workoutDate >= weekStart;
  }).length;

  const thisWeekCalories = fitnessData.workouts
    .filter(w => {
      const workoutDate = new Date(w.date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return workoutDate >= weekStart;
    })
    .reduce((sum, w) => sum + w.calories, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Typography variant="h4" className="font-bold text-gray-800 mb-6">
        Fitness Tracker
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent className="text-center">
              <Dumbbell className="mx-auto mb-2 text-blue-500" size={32} />
              <Typography variant="h6">{fitnessData.stats.totalWorkouts}</Typography>
              <Typography variant="body2" color="textSecondary">Total Workouts</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent className="text-center">
              <Target className="mx-auto mb-2 text-green-500" size={32} />
              <Typography variant="h6">{fitnessData.stats.totalCalories}</Typography>
              <Typography variant="body2" color="textSecondary">Calories Burned</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent className="text-center">
              <TrendingUp className="mx-auto mb-2 text-purple-500" size={32} />
              <Typography variant="h6">{fitnessData.stats.avgDuration}min</Typography>
              <Typography variant="body2" color="textSecondary">Avg Duration</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent className="text-center">
              <Calendar className="mx-auto mb-2 text-orange-500" size={32} />
              <Typography variant="h6">{thisWeekWorkouts}/{fitnessData.goals.weeklyWorkouts}</Typography>
              <Typography variant="body2" color="textSecondary">This Week</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">Weekly Goals</Typography>
          
          <Box className="mb-4">
            <Typography variant="body2" className="mb-1">
              Workouts: {thisWeekWorkouts}/{fitnessData.goals.weeklyWorkouts}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(thisWeekWorkouts / fitnessData.goals.weeklyWorkouts) * 100}
              className="mb-2"
            />
          </Box>
          
          <Box>
            <Typography variant="body2" className="mb-1">
              Calories: {thisWeekCalories}/{fitnessData.goals.weeklyCalories}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(thisWeekCalories / fitnessData.goals.weeklyCalories) * 100}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add Workout */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">Log Workout</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Exercise"
                value={workoutForm.exercise}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, exercise: e.target.value }))}
                fullWidth
                placeholder="Push-ups, Running, etc."
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                label="Duration (min)"
                type="number"
                value={workoutForm.duration}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: e.target.value }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                label="Calories"
                type="number"
                value={workoutForm.calories}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, calories: e.target.value }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="Notes"
                value={workoutForm.notes}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleAddWorkout}
                fullWidth
                className="h-14"
              >
                Add Workout
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Workouts */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">Recent Workouts</Typography>
          
          {fitnessData.workouts.length === 0 ? (
            <Typography color="textSecondary">No workouts logged yet</Typography>
          ) : (
            <div className="space-y-3">
              {fitnessData.workouts.slice(0, 10).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <Typography variant="subtitle1" className="font-medium">
                      {workout.exercise}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {workout.date} • {workout.duration} min
                      {workout.notes && ` • ${workout.notes}`}
                    </Typography>
                  </div>
                  <Chip 
                    label={`${workout.calories} cal`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Fitness;
