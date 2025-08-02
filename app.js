const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

// Database Configuration
const dbConfig = require("./dbConfig");

// Import Controllers - make sure these paths are correct
const { loginUser } = require('./Login/MVC/loginController');
const { signupUser } = require('./SignUp/MVC/signupController');
const medsController = require('./Medicine/MVC/medsController');
const appointmentController = require('./Appointment/MVC/appointmentController');
const journalController = require('./Health Journal/MVC/journalController');
const moodController = require('./DailyPlanner/MVC/dailyController'); 
const emergencyController = require('./Contacts/MVC/emergencyController');
const weatherController = require("./Weather Checker/MVC/weatherController");
const drugController = require('./DrugAnalyser/MVC/drugAnalyserController');

// Import validation middleware
const { validateLogin } = require('./Login/MVC/loginValidation');
const { validateSignup } = require('./SignUp/MVC/signupValidation');
const { validateDate, validateDateID } = require('./Medicine/MVC/medsValidation');
const { authenticate } = require("./Login/authenticate");
const { validateAppointment, validateAppointmentID } = require('./Appointment/MVC/appointmentValidation');
const { validateEmergencyInfo } = require('./Contacts/MVC/emergencyValidation');
const { validateActivity} = require('./Daily-Planner/MVC/dailyPlannerValidation');



const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.use(express.static(path.join(__dirname, 'Weather Checker')));

// Routes
//Signup/Login//
app.post('/login', validateLogin, loginUser);
app.post('/signup', validateSignup, signupUser);


//Medicine//
app.get("/api/meds", authenticate, medsController.getAllDates);
app.get("/api/meds/:id", authenticate, validateDateID, medsController.getDateById);
app.post("/api/meds", authenticate, validateDate, medsController.createDate);
app.put("/api/meds/:id", authenticate, validateDateID, validateDate, medsController.updateDate);
app.delete("/api/meds/:id", authenticate, validateDateID, medsController.deleteDate);



app.get("/api/appointments", authenticate, appointmentController.getAllAppointments);
app.get("/api/appointments/:id", authenticate, validateAppointmentID, appointmentController.getAppointmentById);
app.post("/api/appointments", authenticate, validateAppointment, appointmentController.createAppointment);
app.put("/api/appointments/:id", authenticate, validateAppointmentID, validateAppointment, appointmentController.updateAppointment);
app.delete("/api/appointments/:id", authenticate, validateAppointmentID, appointmentController.deleteAppointment);

//Mood Tracker//
app.get('/api/moods/:userId', moodController.getMoodLogs);
app.post('/api/moods', moodController.logMood);

//Emergency Info Card//
app.get('/api/emergency-info/:userId', emergencyController.getEmergencyInfo);
app.post('/api/emergency-info', validateEmergencyInfo, emergencyController.upsertEmergencyInfo);

//davian//
const dailyPlannerController = require('./Daily-Planner/MVC/dailyPlannerController'); 
const panicButtonController = require('./PanicButton/MVC/panicButtonController');

// Daily Planner Routes
app.get("/api/dailyPlanner/:userId", dailyPlannerController.getAllActivities);

app.get("/api/dailyPlanner/:userId/:id", dailyPlannerController.getActivityById);
app.post("/api/dailyPlanner", validateActivity, dailyPlannerController.createActivity);

app.put("/api/dailyPlanner/:id", dailyPlannerController.updateActivity);
app.delete("/api/dailyPlanner/:id", dailyPlannerController.deleteActivity);

// Panic Button Routes
app.get("/api/panicButton/:userId", authenticate, panicButtonController.getAllEmergencies);
app.get("/api/panicButton/:userId/:id", authenticate, panicButtonController.getEmergencyById);
app.post("/api/panicButton", authenticate, panicButtonController.createEmergency);
app.put("/api/panicButton/:id", authenticate, panicButtonController.updateEmergency);
app.delete("/api/panicButton/:id", authenticate, panicButtonController.deleteEmergency);

//Profile//
const loginController = require('./Login/MVC/loginController');

app.get('/api/users/:id', loginController.getUserById);
app.put('/api/users/:id', loginController.updateUser);
app.delete('/api/users/:id', loginController.deleteUser);

// Weather Checker Routes
app.get("/weather.html", (req, res) => {
  res.sendFile(path.join(__dirname, "Weather Checker", "weather.html"));
});
app.post("/api/weather", weatherController.createWeatherCheck);
app.get("/api/weather", weatherController.getWeatherChecks);
app.put("/api/weather/:id", weatherController.updateWeatherEntry);
app.delete("/api/weather/:id", weatherController.deleteWeatherEntry);

//Drug Analyser
app.post('/drug-analyser', drugController.analyzeDrugs);


let cachedDrugNames = [];
let lastFetchTime = 0;

// Fetch and cache drug names from OpenFDA (refresh every 12 hours)
async function fetchDrugNames() {
  const now = Date.now();
  if (cachedDrugNames.length > 0 && now - lastFetchTime < 12 * 60 * 60 * 1000) {
    return cachedDrugNames;
  }
  try {
    const res = await axios.get('https://api.fda.gov/drug/label.json?count=openfda.generic_name.exact');
    cachedDrugNames = res.data.results.map(r => r.term.toLowerCase());
    lastFetchTime = now;
    return cachedDrugNames;
  } catch (err) {
    console.error('Failed to fetch drug names from OpenFDA:', err.message);
    // fallback to previous cache or empty array
    return cachedDrugNames;
  }
}

app.get('/drug-suggest', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json([]);
  const drugNames = await fetchDrugNames();
  // Fuzzy match: substring or Levenshtein distance <= 2
  const suggestions = drugNames.filter(name =>
    name.includes(q) ||
    getLevenshteinDistance(name, q) <= 2
  ).slice(0, 10);
  res.json(suggestions);
});
// Simple Levenshtein distance for fuzzy matching
function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}


//Quote of the day
app.get('/api/quote', async (req, res) => {
  try {
    const response = await axios.get('https://zenquotes.io/api/today'); // or /random
    const data = response.data;

    if (!data || !Array.isArray(data) || !data[0]) {
      return res.status(500).json({ error: 'Invalid quote data received.' });
    }

    res.json({
      quote: data[0].q,
      author: data[0].a
    });
  } catch (error) {
    console.error('Quote fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});


// Serve all frontend folders as static
app.use(express.static(path.join(__dirname, 'Medicine')));
app.use(express.static(path.join(__dirname, 'Appointment')));
app.use(express.static(path.join(__dirname, 'Health Journal')));
app.use(express.static(path.join(__dirname, 'Login')));
app.use(express.static(path.join(__dirname, 'SignUp')));
app.use(express.static(path.join(__dirname, 'Journal')));
app.use(express.static(path.join(__dirname, 'DailyPlanner')));
app.use(express.static(path.join(__dirname, 'Contacts')));
app.use(express.static(path.join(__dirname, 'Profile')));
app.use(express.static(path.join(__dirname, 'DrugAnalyser')));
app.use(express.static(path.join(__dirname, 'Nutrition Lookup')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.post('/login', loginUser);
app.post('/signup', signupUser);


// Health Journal Routes
app.get('/health-journal/entries', journalController.GetAllEntries);
app.get('/health-journal/search', journalController.SearchEntries); // <-- MOVE THIS UP
app.get('/health-journal', journalController.GetAllEntries);
app.get('/health-journal/:id', journalController.GetEntryById);
app.post('/health-journal', journalController.upload.single('photo'), journalController.CreateEntry);
app.put('/health-journal/:id', journalController.upload.single('photo'), journalController.UpdateEntry);
app.delete('/health-journal/:id', journalController.DeleteEntry);

//Nutrition Lookup Routes
app.get('/nutrition-lookup', (req, res) => {
  res.sendFile(path.join(__dirname, 'Nutrition Lookup', 'nutrition.html'));
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


// Database Connection
async function startServer() {
    try {
        await sql.connect(dbConfig);
        console.log("Database connected");
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
}

// Start the server
startServer();

process.on('SIGINT', async () => {
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
