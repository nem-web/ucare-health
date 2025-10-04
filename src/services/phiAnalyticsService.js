export class PHIAnalyticsService {
  static async calculatePHI() {
    // Mock PHI calculation without backend
    return {
      success: true,
      phi: {
        overall: 78,
        breakdown: {
          sleep: { score: 80, compliance: 85 },
          activity: { score: 82, compliance: 75 },
          nutrition: { score: 74, compliance: 68 },
          mental: { score: 75, compliance: 75 }
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  static async getPHITrend(days = 7) {
    // Mock trend data
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date: date.toISOString().split('T')[0],
        score: 72 + Math.floor(Math.random() * 10),
        breakdown: {
          sleep: { score: 75 + Math.floor(Math.random() * 15), compliance: 80 + Math.floor(Math.random() * 15) },
          activity: { score: 70 + Math.floor(Math.random() * 20), compliance: 70 + Math.floor(Math.random() * 20) },
          nutrition: { score: 65 + Math.floor(Math.random() * 20), compliance: 60 + Math.floor(Math.random() * 25) },
          mental: { score: 70 + Math.floor(Math.random() * 15), compliance: 70 + Math.floor(Math.random() * 15) }
        }
      });
    }
    
    return {
      success: true,
      trend
    };
  }

  static async updateMetrics(metrics) {
    // Mock update response
    return {
      success: true,
      phi: {
        overall: 82,
        breakdown: {
          sleep: { score: 85, compliance: 90 },
          activity: { score: 80, compliance: 85 },
          nutrition: { score: 78, compliance: 75 },
          mental: { score: 77, compliance: 80 }
        }
      },
      message: 'Metrics updated successfully'
    };
  }

  static getComplianceColor(score) {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  static getComplianceLabel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  }
}
