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
const { swaggerUi, swaggerSpec } = require('./swagger');

const { validateMoodLog } = require('./DailyPlanner/MVC/dailyValidation');


const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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

/**
 * @swagger
 * /api/meds:
 *   get:
 *     summary: Get all medicine reminders for a user
 *     tags: [Medicine]
 *     responses:
 *       200:
 *         description: Success
 *//**
 * @swagger
 * /api/meds:
 *   get:
 *     summary: Get all medicine reminders for a user
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of medicine reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicineReminder'
 *       500:
 *         description: Failed to fetch meds
 */
app.get("/api/meds", authenticate, medsController.getAllDates);

/**
 * @swagger
 * /api/meds/{id}:
 *   get:
 *     summary: Get a medicine reminder by ID
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Medicine reminder object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicineReminder'
 *       404:
 *         description: Reminder not found or unauthorized
 *       500:
 *         description: Failed to fetch reminder
 */
app.get("/api/meds/:id", authenticate, validateDateID, medsController.getDateById);

/**
 * @swagger
 * /api/meds:
 *   post:
 *     summary: Create a new medicine reminder
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicineReminderInput'
 *     responses:
 *       201:
 *         description: Reminder added
 *       500:
 *         description: Failed to create reminder
 */
app.post("/api/meds", authenticate, validateDate, medsController.createDate);

/**
 * @swagger
 * /api/meds/{id}:
 *   put:
 *     summary: Update a medicine reminder
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reminder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicineReminderInput'
 *     responses:
 *       200:
 *         description: Reminder updated
 *       404:
 *         description: Reminder not found or unauthorized
 *       500:
 *         description: Failed to update reminder
 */
app.put("/api/meds/:id", authenticate, validateDateID, validateDate, medsController.updateDate);

/**
 * @swagger
 * /api/meds/{id}:
 *   delete:
 *     summary: Delete a medicine reminder
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Reminder deleted
 *       404:
 *         description: Reminder not found or unauthorized
 *       500:
 *         description: Failed to delete reminder
 */
app.delete("/api/meds/:id", authenticate, validateDateID, medsController.deleteDate);/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "pass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profilePicUrl:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
app.post('/login', validateLogin, loginUser);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Test User"
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "pass123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       500:
 *         description: Signup failed
 */
app.post('/signup', validateSignup, signupUser);
app.get("/api/meds", authenticate, medsController.getAllDates);
app.get("/api/meds/:id", authenticate, validateDateID, medsController.getDateById);
app.post("/api/meds", authenticate, validateDate, medsController.createDate);
app.put("/api/meds/:id", authenticate, validateDateID, validateDate, medsController.updateDate);
app.delete("/api/meds/:id", authenticate, validateDateID, medsController.deleteDate);


/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
app.get("/api/appointments", authenticate, appointmentController.getAllAppointments);
/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */
app.get("/api/appointments/:id", authenticate, validateAppointmentID, appointmentController.getAppointmentById);
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
app.post("/api/appointments", authenticate, validateAppointment, appointmentController.createAppointment);
/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an existing appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated
 */
app.put("/api/appointments/:id", authenticate, validateAppointmentID, validateAppointment, appointmentController.updateAppointment);
/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       204:
 *         description: Appointment deleted successfully
 */

app.delete("/api/appointments/:id", authenticate, validateAppointmentID, appointmentController.deleteAppointment);

//Mood Tracker//
app.get('/api/moods/:userId', moodController.getMoodLogs);
app.post('/api/moods', moodController.logMood);
app.delete('/api/moods/:id', moodController.deleteMoodLog);
app.put('/api/moods/:id', moodController.updateMoodLog);
app.post('/api/moods', validateMoodLog, moodController.logMood);

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
app.get("/api/panicButton/:userId",  panicButtonController.getAllEmergencies);
app.get("/api/panicButton/:userId/:id", panicButtonController.getEmergencyById);
app.post("/api/panicButton", panicButtonController.createEmergency);

app.put("/api/panicButton/:id",  panicButtonController.updateEmergency);
app.delete("/api/panicButton/:id", panicButtonController.deleteEmergency);

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
/**
 * @swagger
 * /drug-analyser:
 *   post:
 *     summary: Analyse drug interactions and effects
 *     tags: [Drug Analyser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Drug analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 effects:
 *                   type: array
 *                   items:
 *                     type: string
 *                 warnings:
 *                   type: string
 *                 precautions:
 *                   type: string
 */
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
/**
 * @swagger
 * /health-journal/entries:
 *   get:
 *     summary: Get all health journal entries
 *     tags: [Health Journal]
 *     responses:
 *       200:
 *         description: Array of all health journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HealthJournalEntry'
 */
app.get('/health-journal/entries', journalController.GetAllEntries);
/**
 * @swagger
 * /health-journal/search:
 *   get:
 *     summary: Search health journal entries by date, pain level, or symptoms
 *     tags: [Health Journal]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by entry date (YYYY-MM-DD)
 *       - in: query
 *         name: pain_level
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by pain level (0-10)
 *       - in: query
 *         name: symptoms
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by symptoms (partial match)
 *     responses:
 *       200:
 *         description: Array of matching health journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HealthJournalEntry'
 */
app.get('/health-journal/search', journalController.SearchEntries); 
/**
 * @swagger
 * /health-journal/entries:
 *   get:
 *     summary: Get all health journal entries
 *     tags: [Health Journal]
 *     responses:
 *       200:
 *         description: Array of all health journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HealthJournalEntry'
 */ 
app.get('/health-journal', journalController.GetAllEntries);
/**
 * @swagger
 * /health-journal/{id}:
 *   get:
 *     summary: Get a single health journal entry by ID
 *     tags: [Health Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Health journal entry object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthJournalEntry'
 *       404:
 *         description: Entry not found
 */
app.get('/health-journal/:id', journalController.GetEntryById);
/**
 * @swagger
 * /health-journal:
 *   post:
 *     summary: Create a new health journal entry
 *     tags: [Health Journal]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               pain_level:
 *                 type: integer
 *               symptoms:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Health journal entry created successfully
 */
app.post('/health-journal', journalController.upload.single('photo'), journalController.CreateEntry);
/**
 * @swagger
 * /health-journal/{id}:
 *   put:
 *     summary: Update an existing health journal entry
 *     tags: [Health Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               pain_level:
 *                 type: integer
 *               symptoms:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Health journal entry updated successfully
 */
app.put('/health-journal/:id', journalController.upload.single('photo'), journalController.UpdateEntry);
/**
 * @swagger
 * /health-journal/{id}:
 *   delete:
 *     summary: Delete a health journal entry by ID
 *     tags: [Health Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Entry ID
 *     responses:
 *       204:
 *         description: Health journal entry deleted successfully
 */
app.delete('/health-journal/:id', journalController.DeleteEntry);

//Nutrition Lookup Routes

/**
 * @swagger
 * /nutrition-lookup:
 *   get:
 *     summary: Serve the Nutrition Lookup HTML page
 *     tags: [Nutrition Lookup]
 *     responses:
 *       200:
 *         description: Nutrition Lookup HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
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
