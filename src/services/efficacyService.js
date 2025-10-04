export class EfficacyService {
  static async analyzeEfficacy() {
    // Mock efficacy data
    return {
      success: true,
      reports: [
        {
          symptomType: "Headache",
          medication: "Ibuprofen",
          initialSeverity: 7,
          finalSeverity: 3,
          reduction: 57,
          duration: 2,
          effectiveness: "High",
          dataPoints: 4
        },
        {
          symptomType: "Back Pain",
          medication: "Ibuprofen",
          initialSeverity: 6,
          finalSeverity: 4,
          reduction: 33,
          duration: 3,
          effectiveness: "Moderate",
          dataPoints: 3
        }
      ],
      summary: {
        totalAnalyzed: 2,
        highEffectiveness: 1,
        averageReduction: 45
      }
    };
  }

  static async getMedicationEfficacy(medicationName) {
    // Mock medication-specific data
    return {
      success: true,
      medication: medicationName,
      reports: [
        {
          symptomType: "Headache",
          medication: medicationName,
          initialSeverity: 7,
          finalSeverity: 3,
          reduction: 57,
          duration: 2,
          effectiveness: "High",
          dataPoints: 4
        }
      ],
      totalSymptomInstances: 8
    };
  }

  static getEffectivenessColor(effectiveness) {
    const colors = {
      High: 'text-green-600 bg-green-50',
      Moderate: 'text-yellow-600 bg-yellow-50',
      Low: 'text-red-600 bg-red-50'
    };
    return colors[effectiveness] || 'text-gray-600 bg-gray-50';
  }

  static getEffectivenessIcon(effectiveness) {
    const icons = {
      High: '✅',
      Moderate: '⚡',
      Low: '❌'
    };
    return icons[effectiveness] || 'ℹ️';
  }

  static formatEfficacyReport(report) {
    const { symptomType, medication, reduction, duration, effectiveness } = report;
    
    if (reduction > 0) {
      return `${medication} reduced ${symptomType} severity by ${reduction}% over ${duration} days`;
    } else {
      return `${medication} showed no improvement for ${symptomType} over ${duration} days`;
    }
  }
}
