export const mockHealthData = {
  profile: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    age: "28",
    bloodGroup: "O+",
    height: "165",
    weight: "58",
    emergencyContact: "+1 (555) 123-4567",
    medicalConditions: "None",
    allergies: "Peanuts, Shellfish",
    lastCheckup: "2025-09-15"
  },

  phi: {
    current: 78,
    trend: [72, 74, 76, 75, 77, 79, 78],
    categories: {
      physical: 82,
      mental: 75,
      sleep: 80,
      nutrition: 74
    }
  },
  
  medications: [
    {
      id: 1,
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Daily",
      time: "09:00",
      taken: true,
      nextDue: "2025-10-05T09:00:00"
    },
    {
      id: 2,
      name: "Iron Supplement",
      dosage: "65mg",
      frequency: "Daily",
      time: "18:00",
      taken: false,
      nextDue: "2025-10-04T18:00:00"
    }
  ],

  symptoms: [
    {
      id: 1,
      date: "2025-10-04",
      type: "Headache",
      severity: 3,
      duration: "2 hours",
      notes: "Mild tension headache after work"
    },
    {
      id: 2,
      date: "2025-10-03",
      type: "Fatigue",
      severity: 2,
      duration: "All day",
      notes: "Low energy throughout the day"
    }
  ],

  appointments: [
    {
      id: 1,
      date: "2025-10-08",
      time: "14:30",
      doctor: "Dr. Sarah Johnson",
      type: "General Checkup",
      location: "Main Clinic"
    },
    {
      id: 2,
      date: "2025-10-15",
      time: "10:00",
      doctor: "Dr. Mike Chen",
      type: "Cardiology",
      location: "Heart Center"
    }
  ],

  cycleData: {
    lastPeriod: "2025-09-20",
    cycleLength: 28,
    nextPredicted: "2025-10-18",
    phase: "follicular",
    daysUntilNext: 14,
    symptoms: ["mild_cramps", "mood_changes"],
    fertility: "low",
    logs: [],
    cycleHistory: [
      { startDate: "2025-09-20", endDate: "2025-09-24", length: 28, symptoms: ["cramps", "fatigue"], phiScore: 75 },
      { startDate: "2025-08-23", endDate: "2025-08-27", length: 29, symptoms: ["headache", "bloating"], phiScore: 78 },
      { startDate: "2025-07-25", endDate: "2025-07-29", length: 30, symptoms: ["mood_swings"], phiScore: 72 },
      { startDate: "2025-06-26", endDate: "2025-06-30", length: 28, symptoms: ["cramps", "back_pain"], phiScore: 80 },
      { startDate: "2025-05-29", endDate: "2025-06-02", length: 27, symptoms: ["fatigue", "nausea"], phiScore: 74 },
      { startDate: "2025-05-02", endDate: "2025-05-06", length: 28, symptoms: ["cramps"], phiScore: 76 }
    ],
    averageCycleLength: 28.3,
    standardDeviation: 1.2,
    lastSixCyclesAverage: 28.3,
    currentDelay: 0,
    delayThreshold: 3,
    criticalThreshold: 7
  },

  reminders: [
    {
      id: 1,
      type: "medication",
      title: "Take Iron Supplement",
      time: "18:00",
      active: true
    },
    {
      id: 2,
      type: "appointment",
      title: "Dr. Johnson Checkup",
      time: "14:30",
      date: "2025-10-08",
      active: true
    }
  ]
};
