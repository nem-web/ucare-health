export class DrugInteractionService {
  static async checkInteractions() {
    // Mock interaction data
    return {
      success: true,
      interactions: [
        {
          drug1: "ibuprofen",
          drug2: "aspirin",
          severity: "moderate",
          description: "Increased risk of stomach bleeding when taken together",
          medications: [
            { id: 1, name: "Ibuprofen", dosage: "400mg" },
            { id: 2, name: "Aspirin", dosage: "325mg" }
          ]
        }
      ],
      riskLevel: 2,
      timestamp: new Date().toISOString()
    };
  }

  static async checkMedicationSafety(medications) {
    // Mock safety check
    const hasInteraction = medications.length > 1;
    
    return {
      success: true,
      interactions: hasInteraction ? [
        {
          drug1: "ibuprofen",
          drug2: "aspirin",
          severity: "moderate",
          description: "Increased risk of stomach bleeding"
        }
      ] : [],
      safe: !hasInteraction,
      recommendations: hasInteraction ? [
        {
          message: "Caution: Increased risk of stomach bleeding",
          severity: "moderate",
          action: "Monitor closely and take with food"
        }
      ] : []
    };
  }

  static getSeverityColor(severity) {
    const colors = {
      major: 'text-red-600 bg-red-50',
      moderate: 'text-orange-600 bg-orange-50',
      minor: 'text-yellow-600 bg-yellow-50'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50';
  }

  static getSeverityIcon(severity) {
    const icons = {
      major: '🚨',
      moderate: '⚠️',
      minor: '⚡'
    };
    return icons[severity] || 'ℹ️';
  }
}
