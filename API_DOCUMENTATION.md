# Ucare Health Advanced Analytics API Documentation

## Overview
The Ucare Health backend provides advanced analytical capabilities including:
- **Personalized Health Index (PHI) System**: Real-time health scoring with compliance tracking
- **Drug Interaction Checker**: Safety-critical medication interaction detection
- **Symptom-Drug Efficacy Tracker**: Treatment effectiveness analysis

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently using mock authentication. In production, implement JWT-based auth.

---

## PHI System Endpoints

### Calculate Current PHI
```http
GET /phi/calculate
```

**Response:**
```json
{
  "success": true,
  "phi": {
    "overall": 78,
    "breakdown": {
      "sleep": { "score": 80, "compliance": 85 },
      "activity": { "score": 82, "compliance": 75 },
      "nutrition": { "score": 74, "compliance": 68 },
      "mental": { "score": 75, "compliance": 75 }
    }
  },
  "timestamp": "2025-10-04T14:15:00.000Z"
}
```

### Get PHI Trend
```http
GET /phi/trend?days=7
```

**Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)

**Response:**
```json
{
  "success": true,
  "trend": [
    {
      "date": "2025-10-04",
      "score": 78,
      "breakdown": {
        "sleep": { "score": 80, "compliance": 85 },
        "activity": { "score": 82, "compliance": 75 },
        "nutrition": { "score": 74, "compliance": 68 },
        "mental": { "score": 75, "compliance": 75 }
      }
    }
  ]
}
```

### Update Health Metrics
```http
POST /phi/metrics
```

**Request Body:**
```json
{
  "sleep": {
    "hours": 7.5,
    "quality": 8,
    "compliance": 90
  },
  "activity": {
    "steps": 9000,
    "minutes": 50,
    "intensity": 8
  },
  "nutrition": {
    "calories": 2000,
    "water": 2.2,
    "score": 80
  }
}
```

**Response:**
```json
{
  "success": true,
  "phi": {
    "overall": 82,
    "breakdown": { /* updated breakdown */ }
  },
  "message": "Metrics updated successfully"
}
```

---

## Drug Interaction Checker Endpoints

### Check Current Medications
```http
GET /drugs/interactions
```

**Response:**
```json
{
  "success": true,
  "interactions": [
    {
      "drug1": "ibuprofen",
      "drug2": "warfarin",
      "severity": "major",
      "description": "Increased risk of bleeding",
      "medications": [
        { "id": 1, "name": "Ibuprofen", "dosage": "400mg" },
        { "id": 2, "name": "Warfarin", "dosage": "5mg" }
      ]
    }
  ],
  "riskLevel": 3,
  "timestamp": "2025-10-04T14:15:00.000Z"
}
```

### Check Medication Safety
```http
POST /drugs/check
```

**Request Body:**
```json
{
  "medications": [
    {
      "name": "Ibuprofen",
      "activeIngredient": "ibuprofen",
      "dosage": "400mg"
    },
    {
      "name": "Aspirin",
      "activeIngredient": "acetylsalicylic acid",
      "dosage": "325mg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "interactions": [/* interaction objects */],
  "safe": false,
  "recommendations": [
    {
      "message": "Caution: Increased risk of bleeding",
      "severity": "major",
      "action": "Consult doctor immediately"
    }
  ]
}
```

---

## Symptom-Drug Efficacy Endpoints

### Analyze Treatment Efficacy
```http
GET /efficacy/analyze
```

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "symptomType": "Headache",
      "medication": "Ibuprofen",
      "initialSeverity": 7,
      "finalSeverity": 3,
      "reduction": 57,
      "duration": 2,
      "effectiveness": "High",
      "dataPoints": 4
    }
  ],
  "summary": {
    "totalAnalyzed": 3,
    "highEffectiveness": 2,
    "averageReduction": 45
  }
}
```

### Get Medication-Specific Efficacy
```http
GET /efficacy/medication/:medicationName
```

**Parameters:**
- `medicationName`: Name of the medication to analyze

**Response:**
```json
{
  "success": true,
  "medication": "Ibuprofen",
  "reports": [
    {
      "symptomType": "Headache",
      "medication": "Ibuprofen",
      "initialSeverity": 7,
      "finalSeverity": 3,
      "reduction": 57,
      "duration": 2,
      "effectiveness": "High",
      "dataPoints": 4
    }
  ],
  "totalSymptomInstances": 8
}
```

---

## Comprehensive Health Data

### Get All Analytics
```http
GET /health/comprehensive
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phi": { /* PHI data */ },
    "medications": [ /* medication list */ ],
    "symptoms": [ /* symptom history */ ],
    "analytics": {
      "phi": { /* calculated PHI */ },
      "drugInteractions": [ /* interactions */ ],
      "efficacyReports": [ /* efficacy analysis */ ]
    }
  }
}
```

---

## Data Structures

### PHI Breakdown Object
```typescript
interface PHIBreakdown {
  sleep: {
    score: number;      // 0-100
    compliance: number; // 0-100 percentage
  };
  activity: {
    score: number;      // 0-100
    compliance: number; // 0-100 percentage
  };
  nutrition: {
    score: number;      // 0-100
    compliance: number; // 0-100 percentage
  };
  mental: {
    score: number;      // 0-100
    compliance: number; // 0-100 percentage
  };
}
```

### Drug Interaction Object
```typescript
interface DrugInteraction {
  drug1: string;           // Active ingredient
  drug2: string;           // Active ingredient
  severity: 'major' | 'moderate' | 'minor';
  description: string;     // Human-readable description
  medications: Medication[]; // Affected medications
}
```

### Efficacy Report Object
```typescript
interface EfficacyReport {
  symptomType: string;     // Type of symptom
  medication: string;      // Medication name
  initialSeverity: number; // 1-10 scale
  finalSeverity: number;   // 1-10 scale
  reduction: number;       // Percentage reduction
  duration: number;        // Days of treatment
  effectiveness: 'High' | 'Moderate' | 'Low';
  dataPoints: number;      // Number of symptom entries
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-04T14:15:00.000Z"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

## Security Considerations
- All medication data is encrypted at rest
- Drug interaction checks are logged for safety auditing
- PHI calculations use anonymized data processing
- HIPAA-compliant data handling (production implementation)

## Frontend Integration
The React frontend uses dedicated service classes:
- `PHIAnalyticsService`: PHI calculations and trends
- `DrugInteractionService`: Safety checking
- `EfficacyService`: Treatment effectiveness analysis
