# Ucare Health Tracking Application

A modern, mobile-first health tracking application built with React.js, Material-UI, and Tailwind CSS.

## Features

- **Personalized Health Dashboard**: PHI scores with 7-day trend charts
- **Detailed Records Log**: Track symptoms, medications, and appointments
- **Predictive Cycle Health Advisor**: Menstrual cycle tracking and predictions
- **Smart Reminder System**: Time-based notifications for medications and appointments
- **Mobile-First Design**: Responsive UI with clean card layouts

## Tech Stack

### Frontend
- React.js 18 with Vite
- Material-UI components
- Tailwind CSS for styling
- Lucide React icons
- Recharts for data visualization
- Date-fns for date handling

### Backend
- Express.js with Node.js
- CORS and Helmet for security
- Morgan for logging

## Setup Instructions

### Frontend
```bash
cd ucare-health
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Backend Deployment
Deploy the Express server to platforms like Railway, Render, or Heroku.

## Project Structure

```
ucare-health/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx      # Reusable navigation component
│   │   ├── Dashboard.jsx       # Health dashboard with PHI
│   │   ├── Records.jsx         # Records log with tabs
│   │   └── CycleAdvisor.jsx    # Cycle tracking and predictions
│   ├── data/
│   │   └── mockData.js         # Mock health data structure
│   ├── utils/
│   │   └── reminderSystem.js   # Smart reminder logic
│   └── App.jsx                 # Main application component
├── backend/
│   └── server.js               # Express API server
└── vercel.json                 # Vercel deployment config
```

## Key Features Implementation

### Smart Reminder System
- Time-based medication reminders
- Appointment notifications
- Browser notification API integration
- Configurable reminder windows

### Interactive UI Elements
- Tappable symptom cards with detail modals
- Medication tracking with visual indicators
- Cycle phase visualization with progress bars
- Responsive navigation with active states

### Data Structures
- PHI scoring with trend analysis
- Medication scheduling and tracking
- Symptom logging with severity levels
- Cycle prediction algorithms

## Mobile-First Design
- Bottom navigation for easy thumb access
- Card-based layouts with soft shadows
- Responsive grid systems
- Touch-friendly interactive elements
- Optimized for various screen sizes
