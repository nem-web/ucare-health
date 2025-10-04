import { differenceInDays, addDays, parseISO, format } from 'date-fns';

export class CycleAnalysisService {
  
  // Calculate cycle statistics
  static calculateCycleStats(cycleHistory) {
    if (cycleHistory.length < 2) return null;
    
    const lengths = cycleHistory.map(cycle => cycle.length);
    const average = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
    
    const variance = lengths.reduce((sum, length) => sum + Math.pow(length - average, 2), 0) / lengths.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      averageCycleLength: Math.round(average * 10) / 10,
      standardDeviation: Math.round(standardDeviation * 10) / 10,
      minLength: Math.min(...lengths),
      maxLength: Math.max(...lengths),
      totalCycles: cycleHistory.length
    };
  }

  // Calculate current delay/early arrival
  static calculateCurrentDelay(lastPeriod, averageCycleLength) {
    const lastPeriodDate = parseISO(lastPeriod);
    const expectedDate = addDays(lastPeriodDate, Math.round(averageCycleLength));
    const today = new Date();
    
    return differenceInDays(today, expectedDate);
  }

  // Generate intelligent response based on delay
  static generateIntelligentResponse(delay, standardDeviation, cycleHistory, phiData) {
    const delayThreshold = Math.max(3, standardDeviation * 2);
    const criticalThreshold = Math.max(7, standardDeviation * 3);
    
    if (Math.abs(delay) <= delayThreshold) {
      return this.generateReassuranceResponse(delay, standardDeviation);
    } else if (Math.abs(delay) <= criticalThreshold) {
      return this.generateCautionResponse(delay, cycleHistory, phiData);
    } else {
      return this.generateConsultationResponse(delay, cycleHistory, phiData);
    }
  }

  // Reassuring response for normal variations
  static generateReassuranceResponse(delay, standardDeviation) {
    const isEarly = delay < 0;
    const dayText = Math.abs(delay) === 1 ? 'day' : 'days';
    
    return {
      level: 'normal',
      title: isEarly ? '🌸 Early Arrival - Normal Variation' : '🌿 Slight Delay - Within Normal Range',
      message: `Your cycle is ${Math.abs(delay)} ${dayText} ${isEarly ? 'early' : 'late'}, which is within your normal variation range.`,
      advice: [
        'This is completely normal and within expected variation',
        'Continue your regular self-care routine',
        'Stay hydrated and maintain good sleep habits',
        'Light exercise like walking or yoga can help'
      ],
      selfCare: {
        breathing: 'Try 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8',
        lifestyle: 'Maintain regular sleep schedule and balanced nutrition',
        activity: 'Gentle stretching or meditation for 10 minutes'
      },
      color: 'green',
      urgency: 'low'
    };
  }

  // Cautionary response for moderate delays
  static generateCautionResponse(delay, cycleHistory, phiData) {
    const isEarly = delay < 0;
    const dayText = Math.abs(delay) === 1 ? 'day' : 'days';
    
    return {
      level: 'caution',
      title: isEarly ? '🔄 Notable Early Pattern' : '⏰ Moderate Delay Detected',
      message: `Your cycle is ${Math.abs(delay)} ${dayText} ${isEarly ? 'early' : 'late'}. Let's monitor this pattern.`,
      advice: [
        'This variation is worth noting but not immediately concerning',
        'Consider recent stress, travel, or lifestyle changes',
        'Track symptoms and mood changes more closely',
        'Maintain consistent sleep and nutrition patterns'
      ],
      factors: this.identifyInfluencingFactors(cycleHistory, phiData),
      recommendations: [
        'Log daily symptoms and mood for better tracking',
        'Reduce stress through relaxation techniques',
        'Ensure adequate sleep (7-9 hours nightly)',
        'Consider gentle exercise routine'
      ],
      color: 'orange',
      urgency: 'medium'
    };
  }

  // Consultation response for significant delays
  static generateConsultationResponse(delay, cycleHistory, phiData) {
    const isEarly = delay < 0;
    const dayText = Math.abs(delay) === 1 ? 'day' : 'days';
    
    const summary = this.generateHealthcareSummary(cycleHistory, phiData, delay);
    
    return {
      level: 'consultation',
      title: isEarly ? '📋 Significant Early Pattern - Consider Consultation' : '🏥 Extended Delay - Healthcare Consultation Recommended',
      message: `Your cycle is ${Math.abs(delay)} ${dayText} ${isEarly ? 'early' : 'late'}. A healthcare consultation is recommended.`,
      advice: [
        'This pattern warrants professional medical evaluation',
        'Continue tracking all symptoms and changes',
        'Prepare a summary for your healthcare provider',
        'Schedule an appointment when convenient'
      ],
      summary,
      urgentSigns: [
        'Severe pain or cramping',
        'Heavy bleeding or unusual discharge',
        'Significant mood changes',
        'Other concerning symptoms'
      ],
      color: 'red',
      urgency: 'high'
    };
  }

  // Generate healthcare consultation summary
  static generateHealthcareSummary(cycleHistory, phiData, currentDelay) {
    const lastSixCycles = cycleHistory.slice(0, 6);
    const avgPHI = phiData.trend.reduce((sum, score) => sum + score, 0) / phiData.trend.length;
    
    return {
      cycleOverview: {
        totalCyclesTracked: cycleHistory.length,
        lastSixCycles: lastSixCycles.map(cycle => ({
          date: cycle.startDate,
          length: cycle.length,
          symptoms: cycle.symptoms,
          phiScore: cycle.phiScore
        })),
        averageLength: this.calculateCycleStats(lastSixCycles)?.averageCycleLength || 'N/A',
        currentDelay: currentDelay
      },
      healthMetrics: {
        averagePHI: Math.round(avgPHI),
        recentPHITrend: phiData.trend.slice(-7),
        physicalHealth: phiData.categories.physical,
        mentalHealth: phiData.categories.mental,
        sleepQuality: phiData.categories.sleep,
        nutritionScore: phiData.categories.nutrition
      },
      symptomPatterns: this.analyzeSymptomPatterns(lastSixCycles),
      recommendations: [
        'Share this summary with your healthcare provider',
        'Discuss any recent lifestyle changes or stressors',
        'Ask about hormonal evaluation if patterns persist',
        'Consider tracking basal body temperature'
      ]
    };
  }

  // Analyze symptom patterns across cycles
  static analyzeSymptomPatterns(cycles) {
    const symptomFrequency = {};
    cycles.forEach(cycle => {
      cycle.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([symptom, frequency]) => ({
        symptom: symptom.replace('_', ' '),
        frequency,
        percentage: Math.round((frequency / cycles.length) * 100)
      }));
  }

  // Identify factors that might influence cycle
  static identifyInfluencingFactors(cycleHistory, phiData) {
    const factors = [];
    
    // Check PHI trends
    const recentPHI = phiData.trend.slice(-3);
    const avgRecentPHI = recentPHI.reduce((sum, score) => sum + score, 0) / recentPHI.length;
    
    if (avgRecentPHI < 70) {
      factors.push('Lower recent health scores may indicate stress or lifestyle factors');
    }
    
    if (phiData.categories.sleep < 70) {
      factors.push('Poor sleep quality can affect cycle regularity');
    }
    
    if (phiData.categories.mental < 70) {
      factors.push('Stress or mental health factors may influence cycle timing');
    }
    
    // Check cycle length trends
    const recentCycles = cycleHistory.slice(0, 3);
    const lengths = recentCycles.map(c => c.length);
    const isIncreasing = lengths[0] > lengths[1] && lengths[1] > lengths[2];
    const isDecreasing = lengths[0] < lengths[1] && lengths[1] < lengths[2];
    
    if (isIncreasing) {
      factors.push('Recent cycles show increasing length trend');
    } else if (isDecreasing) {
      factors.push('Recent cycles show decreasing length trend');
    }
    
    return factors;
  }

  // Predict next cycle with confidence interval
  static predictNextCycle(cycleHistory, currentDelay) {
    if (cycleHistory.length < 3) return null;
    
    const stats = this.calculateCycleStats(cycleHistory);
    const lastPeriod = parseISO(cycleHistory[0].startDate);
    
    const predictedDate = addDays(lastPeriod, Math.round(stats.averageCycleLength));
    const earliestDate = addDays(predictedDate, -Math.ceil(stats.standardDeviation));
    const latestDate = addDays(predictedDate, Math.ceil(stats.standardDeviation));
    
    return {
      predictedDate: format(predictedDate, 'yyyy-MM-dd'),
      earliestDate: format(earliestDate, 'yyyy-MM-dd'),
      latestDate: format(latestDate, 'yyyy-MM-dd'),
      confidence: Math.max(70, 100 - (stats.standardDeviation * 10))
    };
  }
}
