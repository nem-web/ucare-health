import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Fab, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Calendar, Heart, Droplets, TrendingUp, Edit, Plus, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { CycleAnalysisService } from '../services/cycleAnalysisService';

const CycleAdvisor = ({ cycleData, healthData, onUpdateCycle }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editData, setEditData] = useState(cycleData);
  const [logData, setLogData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    flow: 'medium',
    symptoms: [],
    mood: 'normal',
    notes: ''
  });
  const [analysis, setAnalysis] = useState(null);

  // Calculate intelligent analysis on component mount and data changes
  useEffect(() => {
    if (cycleData?.cycleHistory && cycleData.cycleHistory.length > 0) {
      const stats = CycleAnalysisService.calculateCycleStats(cycleData.cycleHistory);
      if (stats) {
        const currentDelay = CycleAnalysisService.calculateCurrentDelay(
          cycleData.lastPeriod, 
          stats.averageCycleLength
        );
        
        const intelligentResponse = CycleAnalysisService.generateIntelligentResponse(
          currentDelay,
          stats.standardDeviation,
          cycleData.cycleHistory,
          healthData?.phi || { trend: [75], categories: { physical: 75, mental: 75, sleep: 75, nutrition: 75 } }
        );

        const prediction = CycleAnalysisService.predictNextCycle(cycleData.cycleHistory, currentDelay);

        setAnalysis({
          stats,
          currentDelay,
          intelligentResponse,
          prediction
        });
      }
    } else {
      setAnalysis(null);
    }
  }, [cycleData, healthData]);

  const getPhaseColor = (phase) => {
    const colors = {
      menstrual: 'bg-red-100 text-red-800',
      follicular: 'bg-blue-100 text-blue-800',
      ovulation: 'bg-green-100 text-green-800',
      luteal: 'bg-purple-100 text-purple-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const getResponseColor = (level) => {
    const colors = {
      normal: 'success',
      caution: 'warning',
      consultation: 'error'
    };
    return colors[level] || 'info';
  };

  // Calculate dynamic cycle information
  const calculateDynamicCycle = () => {
    const lastPeriodDate = new Date(cycleData.lastPeriod);
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    const cycleLength = cycleData.cycleLength || 28;
    
    // Calculate current cycle day
    const currentDay = (daysSinceLastPeriod % cycleLength) + 1;
    
    // Calculate days until next period
    const daysUntilNext = cycleLength - (daysSinceLastPeriod % cycleLength);
    
    // Determine current phase based on cycle day
    let phase = 'follicular';
    if (currentDay <= 5) phase = 'menstrual';
    else if (currentDay >= 12 && currentDay <= 16) phase = 'ovulation';
    else if (currentDay > 16) phase = 'luteal';
    
    return {
      currentDay,
      daysUntilNext,
      phase,
      daysSinceLastPeriod
    };
  };

  const dynamicCycle = calculateDynamicCycle();
  const cycleProgress = (dynamicCycle.currentDay / (cycleData.cycleLength || 28)) * 100;

  const handleEditSave = () => {
    onUpdateCycle(editData);
    setEditDialogOpen(false);
  };

  const handleLogSave = () => {
    const newLog = { ...logData, id: Date.now() };
    const updatedCycle = {
      ...cycleData,
      logs: [...(cycleData.logs || []), newLog],
      // Update phase based on current dynamic calculation
      phase: dynamicCycle.phase,
      daysUntilNext: dynamicCycle.daysUntilNext
    };
    
    onUpdateCycle(updatedCycle);
    setLogDialogOpen(false);
    setLogData({
      date: format(new Date(), 'yyyy-MM-dd'),
      flow: 'medium',
      symptoms: [],
      mood: 'normal',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Intelligent Analysis Alert */}
      {analysis?.intelligentResponse && (
        <Alert 
          severity={getResponseColor(analysis.intelligentResponse.level)}
          className="shadow-md"
        >
          <div className="space-y-2">
            <Typography variant="h6" className="font-semibold">
              {analysis.intelligentResponse.title}
            </Typography>
            <Typography variant="body2">
              {analysis.intelligentResponse.message}
            </Typography>
            
            {analysis.intelligentResponse.level === 'normal' && analysis.intelligentResponse.selfCare && (
              <div className="mt-3 space-y-2">
                <Typography variant="subtitle2" className="font-medium">Quick Self-Care:</Typography>
                <Typography variant="body2">• {analysis.intelligentResponse.selfCare.breathing}</Typography>
                <Typography variant="body2">• {analysis.intelligentResponse.selfCare.activity}</Typography>
              </div>
            )}

            {analysis.intelligentResponse.level === 'consultation' && (
              <Button 
                variant="outlined" 
                size="small" 
                className="mt-2"
                onClick={() => {/* Open healthcare summary dialog */}}
              >
                View Healthcare Summary
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Current Cycle Status */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <Typography variant="h4" className="font-bold text-primary mb-2">
                Day {dynamicCycle.currentDay}
              </Typography>
              <Chip 
                label={dynamicCycle.phase.charAt(0).toUpperCase() + dynamicCycle.phase.slice(1)} 
                className={`${getPhaseColor(dynamicCycle.phase)} font-medium`}
              />
              {analysis?.currentDelay !== undefined && analysis.currentDelay !== 0 && (
                <Typography variant="caption" className="block mt-2 text-gray-600">
                  {analysis.currentDelay > 0 ? `${analysis.currentDelay} days late` : `${Math.abs(analysis.currentDelay)} days early`}
                </Typography>
              )}
            </div>
            <Button
              startIcon={<Edit size={16} />}
              onClick={() => setEditDialogOpen(true)}
              size="small"
              variant="outlined"
            >
              Edit
            </Button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Typography variant="body2" className="text-gray-600">
                Cycle Progress
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {Math.round(cycleProgress)}%
              </Typography>
            </div>
            <LinearProgress 
              variant="determinate" 
              value={cycleProgress} 
              className="h-3 rounded-full"
            />
          </div>
          
          <div className="text-center">
            <Typography variant="body1" className="text-gray-700">
              {dynamicCycle.daysUntilNext} days until next period
            </Typography>
            {analysis?.prediction && (
              <Typography variant="caption" className="text-gray-500 block mt-1">
                Predicted: {format(new Date(analysis.prediction.predictedDate), 'MMM dd')} 
                ({analysis.prediction.confidence}% confidence)
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cycle Statistics */}
      {analysis?.stats && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Typography variant="h6" className="font-semibold mb-4 flex items-center">
              <Activity className="mr-2" size={20} />
              Cycle Analytics
            </Typography>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Typography variant="h5" className="font-bold text-primary">
                  {analysis.stats.averageCycleLength}
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  Average Length (days)
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="h5" className="font-bold text-secondary">
                  ±{analysis.stats.standardDeviation}
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  Variation Range
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show message when no cycle history */}
      {(!cycleData.cycleHistory || cycleData.cycleHistory.length === 0) && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Typography variant="h6" className="font-semibold mb-2">
              Start Tracking Your Cycles
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Log a few cycles to unlock intelligent predictions and personalized health insights.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setLogDialogOpen(true)}
              startIcon={<Plus size={16} />}
            >
              Log First Cycle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Recommendations */}
      {analysis?.intelligentResponse?.advice && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Typography variant="h6" className="font-semibold mb-4">
              Personalized Recommendations
            </Typography>
            <div className="space-y-2">
              {analysis.intelligentResponse.advice.map((advice, index) => (
                <Typography key={index} variant="body2" className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {advice}
                </Typography>
              ))}
            </div>
            
            {analysis.intelligentResponse.factors && analysis.intelligentResponse.factors.length > 0 && (
              <div className="mt-4">
                <Typography variant="subtitle2" className="font-medium mb-2">
                  Potential Influencing Factors:
                </Typography>
                {analysis.intelligentResponse.factors.map((factor, index) => (
                  <Typography key={index} variant="body2" className="text-gray-600 flex items-start">
                    <AlertTriangle size={14} className="mr-2 mt-0.5 text-orange-500" />
                    {factor}
                  </Typography>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Healthcare Summary (for consultation level) */}
      {analysis?.intelligentResponse?.level === 'consultation' && analysis.intelligentResponse.summary && (
        <Card className="shadow-md border-l-4 border-red-500">
          <CardContent className="p-6">
            <Typography variant="h6" className="font-semibold mb-4 text-red-700">
              Healthcare Consultation Summary
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Cycle Overview (Last 6 Cycles)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="space-y-2">
                  <Typography variant="body2">
                    <strong>Average Length:</strong> {analysis.intelligentResponse.summary.cycleOverview.averageLength} days
                  </Typography>
                  <Typography variant="body2">
                    <strong>Current Delay:</strong> {analysis.intelligentResponse.summary.cycleOverview.currentDelay} days
                  </Typography>
                  <div className="mt-3">
                    <Typography variant="subtitle2" className="font-medium">Recent Cycles:</Typography>
                    {analysis.intelligentResponse.summary.cycleOverview.lastSixCycles.slice(0, 3).map((cycle, index) => (
                      <Typography key={index} variant="body2" className="text-gray-600">
                        {format(new Date(cycle.date), 'MMM dd')}: {cycle.length} days, PHI: {cycle.phiScore}
                      </Typography>
                    ))}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Health Metrics</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2"><strong>Average PHI:</strong> {analysis.intelligentResponse.summary.healthMetrics.averagePHI}</Typography>
                    <Typography variant="body2"><strong>Physical:</strong> {analysis.intelligentResponse.summary.healthMetrics.physicalHealth}</Typography>
                  </div>
                  <div>
                    <Typography variant="body2"><strong>Mental:</strong> {analysis.intelligentResponse.summary.healthMetrics.mentalHealth}</Typography>
                    <Typography variant="body2"><strong>Sleep:</strong> {analysis.intelligentResponse.summary.healthMetrics.sleepQuality}</Typography>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Current Symptoms */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Current Symptoms
          </Typography>
          <div className="flex flex-wrap gap-2">
            {cycleData.symptoms && cycleData.symptoms.length > 0 ? (
              cycleData.symptoms.map((symptom, index) => (
                <Chip 
                  key={index}
                  label={symptom.replace('_', ' ')}
                  className="bg-blue-50 text-blue-700"
                  size="small"
                />
              ))
            ) : (
              <Typography variant="body2" className="text-gray-500">
                No symptoms logged for current phase
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Recent Logs
          </Typography>
          {cycleData.logs && cycleData.logs.length > 0 ? (
            <div className="space-y-3">
              {cycleData.logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Typography variant="body2" className="font-medium">
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Flow: {log.flow} • Mood: {log.mood}
                    </Typography>
                    {log.notes && (
                      <Typography variant="caption" className="text-gray-500 block">
                        {log.notes}
                      </Typography>
                    )}
                  </div>
                  <CheckCircle className="text-green-500 w-4 h-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Typography variant="body2" className="text-gray-500 mb-3">
                No logs yet. Start tracking your daily cycle information.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setLogDialogOpen(true)}
                startIcon={<Plus size={16} />}
                size="small"
              >
                Add First Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Current Symptoms
          </Typography>
          <div className="flex flex-wrap gap-2">
            {cycleData.symptoms.map((symptom, index) => (
              <Chip 
                key={index}
                label={symptom.replace('_', ' ')}
                className="bg-blue-50 text-blue-700"
                size="small"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => setLogDialogOpen(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '16px',
          zIndex: 1000
        }}
      >
        <Plus />
      </Fab>

      {/* Dialogs remain the same... */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Cycle Information</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              label="Last Period Date"
              type="date"
              value={editData.lastPeriod}
              onChange={(e) => setEditData(prev => ({ ...prev, lastPeriod: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <TextField
              label="Cycle Length (days)"
              type="number"
              value={editData.cycleLength}
              onChange={(e) => setEditData(prev => ({ ...prev, cycleLength: parseInt(e.target.value) }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Current Phase</InputLabel>
              <Select
                value={editData.phase}
                onChange={(e) => setEditData(prev => ({ ...prev, phase: e.target.value }))}
              >
                <MenuItem value="menstrual">Menstrual</MenuItem>
                <MenuItem value="follicular">Follicular</MenuItem>
                <MenuItem value="ovulation">Ovulation</MenuItem>
                <MenuItem value="luteal">Luteal</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Daily Entry</DialogTitle>
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

            <FormControl fullWidth>
              <InputLabel>Flow</InputLabel>
              <Select
                value={logData.flow}
                onChange={(e) => setLogData(prev => ({ ...prev, flow: e.target.value }))}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="heavy">Heavy</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Mood</InputLabel>
              <Select
                value={logData.mood}
                onChange={(e) => setLogData(prev => ({ ...prev, mood: e.target.value }))}
              >
                <MenuItem value="great">Great</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="irritable">Irritable</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              value={logData.notes}
              onChange={(e) => setLogData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
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

export default CycleAdvisor;
