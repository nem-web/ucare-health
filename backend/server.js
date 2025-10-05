import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://172.26.0.1:5176',
    'http://127.0.0.1:5173',
    'https://ucare-dt.vercel.app',
    /\.vercel\.app$/,
    /localhost:\d+$/,
    /172\.26\.0\.1:\d+$/,
    /127\.0\.0\.1:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://userdigitech94_db_user:8WyMjolPfMEyzAOY@ucare.2icem3b.mongodb.net/?retryWrites=true&w=majority&appName=Ucare';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.log('Continuing without MongoDB - using in-memory storage');
    // Don't exit, continue with in-memory storage
  }
};

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const healthDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  profile: mongoose.Schema.Types.Mixed,
  medications: mongoose.Schema.Types.Mixed,
  symptoms: mongoose.Schema.Types.Mixed,
  cycleData: mongoose.Schema.Types.Mixed,
  metrics: mongoose.Schema.Types.Mixed,
  waterSettings: mongoose.Schema.Types.Mixed,
  waterLog: mongoose.Schema.Types.Mixed,
  phi: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);
const HealthData = mongoose.model('HealthData', healthDataSchema);

// Connect to MongoDB
connectDB();

// API Routes

// Get user health data
app.get('/api/health/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (isMongoConnected()) {
      const healthData = await HealthData.findOne({ userId });
      
      if (!healthData) {
        return res.status(404).json({ error: 'Health data not found' });
      }
      
      res.json(healthData);
    } else {
      // Use in-memory storage
      const healthData = memoryStorage.get(userId);
      
      if (!healthData) {
        return res.status(404).json({ error: 'Health data not found' });
      }
      
      res.json(healthData);
    }
  } catch (error) {
    console.error('Error getting health data:', error);
    res.status(500).json({ error: error.message });
  }
});

// In-memory storage fallback
let memoryStorage = new Map();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Save/Update user health data
app.post('/api/health/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const healthData = req.body;
    
    console.log('Saving health data for user:', userId);
    
    if (isMongoConnected()) {
      // Use findOneAndUpdate with upsert to update existing or create new
      const updatedData = await HealthData.findOneAndUpdate(
        { userId },
        { ...healthData, userId, updatedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log('Data saved to MongoDB successfully');
      res.json({ success: true, data: updatedData });
    } else {
      // Use in-memory storage
      memoryStorage.set(userId, { ...healthData, userId, updatedAt: new Date() });
      console.log('Data saved to memory storage');
      res.json({ success: true, data: memoryStorage.get(userId) });
    }
  } catch (error) {
    console.error('Error saving health data:', error);
    // Fallback to memory storage
    try {
      memoryStorage.set(req.params.userId, { ...req.body, userId: req.params.userId, updatedAt: new Date() });
      res.json({ success: true, data: memoryStorage.get(req.params.userId), fallback: true });
    } catch (fallbackError) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please sign up first.' });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      res.json({ 
        success: true, 
        user: {
          uid: user.userId,
          email: user.email,
          displayName: user.displayName
        }
      });
    } else {
      // Use in-memory storage
      let userFound = null;
      for (let [key, value] of memoryStorage.entries()) {
        if (key.startsWith('user_') && value.email === email) {
          userFound = value;
          break;
        }
      }
      
      if (!userFound) {
        return res.status(404).json({ error: 'User not found. Please sign up first.' });
      }
      
      if (userFound.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      userFound.lastLogin = new Date();
      memoryStorage.set(`user_${userFound.userId}`, userFound);
      
      res.json({ 
        success: true, 
        user: {
          uid: userFound.userId,
          email: userFound.email,
          displayName: userFound.displayName
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user exists by email
app.get('/api/users/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    
    console.log('Checking if user exists:', decodedEmail);
    
    if (isMongoConnected()) {
      const user = await User.findOne({ email: decodedEmail });
      
      if (user) {
        res.json({ exists: true, user });
      } else {
        res.json({ exists: false });
      }
    } else {
      // Use in-memory storage
      let userFound = null;
      for (let [key, value] of memoryStorage.entries()) {
        if (key.startsWith('user_') && value.email === decodedEmail) {
          userFound = value;
          break;
        }
      }
      
      if (userFound) {
        res.json({ exists: true, user: userFound });
      } else {
        res.json({ exists: false });
      }
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user login timestamp
app.patch('/api/users/:userId/login', async (req, res) => {
  try {
    const { userId } = req.params;
    const { lastLogin } = req.body;
    
    console.log('Updating login for user:', userId);
    
    if (isMongoConnected()) {
      const user = await User.findOneAndUpdate(
        { userId },
        { lastLogin: lastLogin || new Date(), updatedAt: new Date() },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ success: true, user });
    } else {
      // Use in-memory storage
      const user = memoryStorage.get(`user_${userId}`);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      user.lastLogin = lastLogin || new Date();
      user.updatedAt = new Date();
      memoryStorage.set(`user_${userId}`, user);
      
      res.json({ success: true, user });
    }
  } catch (error) {
    console.error('Error updating user login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create/Update user
app.post('/api/users', async (req, res) => {
  try {
    const { userId, email, password, displayName, createdAt, lastLogin } = req.body;
    
    console.log('Creating/updating user:', { userId, email, displayName });
    
    if (isMongoConnected()) {
      // Check if user already exists by email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const user = await User.create({
        userId, 
        email,
        password,
        displayName, 
        createdAt: createdAt || new Date(),
        lastLogin: lastLogin || new Date(),
        updatedAt: new Date() 
      });
      
      console.log('User created in MongoDB:', user);
      res.json({ success: true, user });
    } else {
      // Use in-memory storage
      // Check if user already exists by email
      for (let [key, value] of memoryStorage.entries()) {
        if (key.startsWith('user_') && value.email === email) {
          return res.status(409).json({ error: 'User with this email already exists' });
        }
      }

      const userData = {
        userId, 
        email, 
        displayName, 
        createdAt: createdAt || new Date(),
        lastLogin: lastLogin || new Date(),
        updatedAt: new Date()
      };
      memoryStorage.set(`user_${userId}`, userData);
      console.log('User created in memory storage');
      res.json({ success: true, user: userData });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get user
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (isMongoConnected()) {
      const user = await User.findOne({ userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } else {
      // Use in-memory storage
      const user = memoryStorage.get(`user_${userId}`);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update specific data sections
app.patch('/api/health/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = req.body;
    
    const updatedData = await HealthData.findOneAndUpdate(
      { userId },
      { $set: { profile, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, profile: updatedData.profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/health/:userId/medications', async (req, res) => {
  try {
    const { userId } = req.params;
    const medications = req.body;
    
    const updatedData = await HealthData.findOneAndUpdate(
      { userId },
      { $set: { medications, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, medications: updatedData.medications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/health/:userId/cycle', async (req, res) => {
  try {
    const { userId } = req.params;
    const cycleData = req.body;
    
    const updatedData = await HealthData.findOneAndUpdate(
      { userId },
      { $set: { cycleData, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, cycleData: updatedData.cycleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Ucare Health Backend with MongoDB running on port ${PORT}`);
});
