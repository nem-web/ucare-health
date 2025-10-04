import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://ucare-dt.vercel.app',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());

// Mock database with enhanced analytics data
let healthData = {
  phi: {
    current: 78,
    trend: [72, 74, 76, 75, 77, 79, 78],
    categories: { physical: 82, mental: 75, sleep: 80, nutrition: 74 },
    rawMetrics: {
      sleep: { hours: 7.2, quality: 8, compliance: 85 },
      activity: { steps: 8500, minutes: 45, intensity: 7 },
      nutrition: { calories: 2100, water: 2.1, score: 74 }
    }
  },
  medications: [
    { 
      id: 1, 
      name: "Ibuprofen", 
      dosage: "400mg", 
      frequency: "Twice daily", 
      startDate: "2025-09-20",
      activeIngredient: "ibuprofen",
      category: "NSAID"
    },
    { 
      id: 2, 
      name: "Vitamin D3", 
      dosage: "1000 IU", 
      frequency: "Daily", 
      startDate: "2025-09-15",
      activeIngredient: "cholecalciferol",
      category: "Vitamin"
    }
  ],
  symptoms: [
    { 
      id: 1, 
      date: "2025-10-04", 
      type: "Headache", 
      severity: 3, 
      duration: "2 hours",
      medicationTaken: "Ibuprofen",
      medicationTime: "2025-10-04T10:00:00"
    },
    { 
      id: 2, 
      date: "2025-10-03", 
      type: "Headache", 
      severity: 7, 
      duration: "4 hours",
      medicationTaken: "Ibuprofen",
      medicationTime: "2025-10-03T14:00:00"
    }
  ],
  drugInteractions: [
    {
      drug1: "ibuprofen",
      drug2: "warfarin",
      severity: "major",
      description: "Increased risk of bleeding"
    }
  ]
};

// PHI Calculation Engine
class PHICalculator {
  static calculatePHI(metrics) {
    const weights = { sleep: 0.3, activity: 0.3, nutrition: 0.25, mental: 0.15 };
    
    const sleepScore = this.calculateSleepScore(metrics.sleep);
    const activityScore = this.calculateActivityScore(metrics.activity);
    const nutritionScore = metrics.nutrition.score;
    const mentalScore = 75; // Mock mental health score
    
    const phi = (
      sleepScore * weights.sleep +
      activityScore * weights.activity +
      nutritionScore * weights.nutrition +
      mentalScore * weights.mental
    );
    
    return {
      overall: Math.round(phi),
      breakdown: {
        sleep: { score: sleepScore, compliance: metrics.sleep.compliance },
        activity: { score: activityScore, compliance: this.getActivityCompliance(metrics.activity) },
        nutrition: { score: nutritionScore, compliance: this.getNutritionCompliance(metrics.nutrition) },
        mental: { score: mentalScore, compliance: 75 }
      }
    };
  }
  
  static calculateSleepScore(sleep) {
    const idealHours = 8;
    const hoursScore = Math.max(0, 100 - Math.abs(sleep.hours - idealHours) * 10);
    const qualityScore = sleep.quality * 10;
    return Math.round((hoursScore + qualityScore) / 2);
  }
  
  static calculateActivityScore(activity) {
    const stepScore = Math.min(100, (activity.steps / 10000) * 100);
    const minuteScore = Math.min(100, (activity.minutes / 60) * 100);
    const intensityScore = activity.intensity * 10;
    return Math.round((stepScore + minuteScore + intensityScore) / 3);
  }
  
  static getActivityCompliance(activity) {
    return Math.min(100, (activity.steps / 8000) * 100);
  }
  
  static getNutritionCompliance(nutrition) {
    const waterCompliance = Math.min(100, (nutrition.water / 2.0) * 100);
    const calorieCompliance = nutrition.calories > 1800 && nutrition.calories < 2400 ? 100 : 70;
    return Math.round((waterCompliance + calorieCompliance) / 2);
  }
}

// Drug Interaction Checker
class DrugInteractionChecker {
  static checkInteractions(medications) {
    const interactions = [];
    const activeIngredients = medications.map(med => med.activeIngredient.toLowerCase());
    
    // Check against known interactions
    healthData.drugInteractions.forEach(interaction => {
      if (activeIngredients.includes(interaction.drug1) && 
          activeIngredients.includes(interaction.drug2)) {
        interactions.push({
          ...interaction,
          medications: medications.filter(med => 
            med.activeIngredient.toLowerCase() === interaction.drug1 ||
            med.activeIngredient.toLowerCase() === interaction.drug2
          )
        });
      }
    });
    
    return interactions;
  }
}

// Symptom-Drug Efficacy Tracker
class EfficacyTracker {
  static analyzeEfficacy(symptoms, medications) {
    const efficacyReports = [];
    
    // Group symptoms by type and medication
    const symptomGroups = symptoms.reduce((groups, symptom) => {
      const key = `${symptom.type}-${symptom.medicationTaken}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(symptom);
      return groups;
    }, {});
    
    Object.entries(symptomGroups).forEach(([key, symptomList]) => {
      if (symptomList.length >= 2) {
        const [symptomType, medication] = key.split('-');
        const sortedSymptoms = symptomList.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const initialSeverity = sortedSymptoms[0].severity;
        const finalSeverity = sortedSymptoms[sortedSymptoms.length - 1].severity;
        const reduction = ((initialSeverity - finalSeverity) / initialSeverity) * 100;
        const duration = Math.ceil((new Date(sortedSymptoms[sortedSymptoms.length - 1].date) - 
                                   new Date(sortedSymptoms[0].date)) / (1000 * 60 * 60 * 24));
        
        efficacyReports.push({
          symptomType,
          medication,
          initialSeverity,
          finalSeverity,
          reduction: Math.round(reduction),
          duration,
          effectiveness: reduction > 30 ? 'High' : reduction > 10 ? 'Moderate' : 'Low',
          dataPoints: sortedSymptoms.length
        });
      }
    });
    
    return efficacyReports;
  }
}

// API Routes

// check api root
app.get('/', (req, res) => {
  res.send('🚀 Ucare Health Backend is live!');
});

// PHI System Endpoints
app.get('/api/phi/calculate', (req, res) => {
  const phi = PHICalculator.calculatePHI(healthData.phi.rawMetrics);
  res.json({
    success: true,
    phi,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/phi/trend', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const trend = healthData.phi.trend.slice(-days);
  
  res.json({
    success: true,
    trend: trend.map((score, index) => ({
      date: new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score,
      breakdown: PHICalculator.calculatePHI(healthData.phi.rawMetrics).breakdown
    }))
  });
});

app.post('/api/phi/metrics', (req, res) => {
  const { sleep, activity, nutrition } = req.body;
  
  if (sleep) healthData.phi.rawMetrics.sleep = { ...healthData.phi.rawMetrics.sleep, ...sleep };
  if (activity) healthData.phi.rawMetrics.activity = { ...healthData.phi.rawMetrics.activity, ...activity };
  if (nutrition) healthData.phi.rawMetrics.nutrition = { ...healthData.phi.rawMetrics.nutrition, ...nutrition };
  
  const newPHI = PHICalculator.calculatePHI(healthData.phi.rawMetrics);
  healthData.phi.current = newPHI.overall;
  healthData.phi.trend.push(newPHI.overall);
  
  res.json({
    success: true,
    phi: newPHI,
    message: 'Metrics updated successfully'
  });
});

// Drug Interaction Checker Endpoints
app.get('/api/drugs/interactions', (req, res) => {
  const interactions = DrugInteractionChecker.checkInteractions(healthData.medications);
  
  res.json({
    success: true,
    interactions,
    riskLevel: interactions.length > 0 ? 
      Math.max(...interactions.map(i => i.severity === 'major' ? 3 : i.severity === 'moderate' ? 2 : 1)) : 0,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/drugs/check', (req, res) => {
  const { medications } = req.body;
  const interactions = DrugInteractionChecker.checkInteractions(medications);
  
  res.json({
    success: true,
    interactions,
    safe: interactions.length === 0,
    recommendations: interactions.map(interaction => ({
      message: `Caution: ${interaction.description}`,
      severity: interaction.severity,
      action: interaction.severity === 'major' ? 'Consult doctor immediately' : 'Monitor closely'
    }))
  });
});

// Symptom-Drug Efficacy Endpoints
app.get('/api/efficacy/analyze', (req, res) => {
  const efficacyReports = EfficacyTracker.analyzeEfficacy(healthData.symptoms, healthData.medications);
  
  res.json({
    success: true,
    reports: efficacyReports,
    summary: {
      totalAnalyzed: efficacyReports.length,
      highEffectiveness: efficacyReports.filter(r => r.effectiveness === 'High').length,
      averageReduction: Math.round(efficacyReports.reduce((sum, r) => sum + r.reduction, 0) / efficacyReports.length) || 0
    }
  });
});

app.get('/api/efficacy/medication/:medicationName', (req, res) => {
  const { medicationName } = req.params;
  const medicationSymptoms = healthData.symptoms.filter(s => 
    s.medicationTaken && s.medicationTaken.toLowerCase().includes(medicationName.toLowerCase())
  );
  
  const efficacyReports = EfficacyTracker.analyzeEfficacy(medicationSymptoms, healthData.medications);
  
  res.json({
    success: true,
    medication: medicationName,
    reports: efficacyReports,
    totalSymptomInstances: medicationSymptoms.length
  });
});

// Enhanced Health Data Endpoints
app.get('/api/health/comprehensive', (req, res) => {
  const phi = PHICalculator.calculatePHI(healthData.phi.rawMetrics);
  const interactions = DrugInteractionChecker.checkInteractions(healthData.medications);
  const efficacy = EfficacyTracker.analyzeEfficacy(healthData.symptoms, healthData.medications);
  
  res.json({
    success: true,
    data: {
      ...healthData,
      analytics: {
        phi,
        drugInteractions: interactions,
        efficacyReports: efficacy
      }
    }
  });
});

// Existing basic endpoints
app.get('/api/health', (req, res) => {
  res.json(healthData);
});

app.post('/api/medications/:id/take', (req, res) => {
  const { id } = req.params;
  const medication = healthData.medications.find(med => med.id === parseInt(id));
  
  if (medication) {
    medication.taken = true;
    res.json({ success: true, medication });
  } else {
    res.status(404).json({ error: 'Medication not found' });
  }
});

app.post('/api/symptoms', (req, res) => {
  const newSymptom = {
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  
  healthData.symptoms.unshift(newSymptom);
  res.status(201).json(newSymptom);
});

app.listen(PORT, () => {
  console.log(`Ucare Health Backend with Advanced Analytics running on port`);
});
