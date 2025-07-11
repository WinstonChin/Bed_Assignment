const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

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

// Import validation middleware
const { validateLogin } = require('./Login/MVC/loginValidation');
const { validateSignup } = require('./SignUp/MVC/signupValidation');
const { validateDate, validateDateID } = require('./Medicine/MVC/medsValidation');
const { authenticate } = require("./Login/authenticate");
const { validateAppointment, validateAppointmentID } = require('./Appointment/MVC/appointmentValidation');
const { validateEmergencyInfo } = require('./Contacts/MVC/emergencyValidation');



const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

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



//Appointment//
app.get("/api/appointments", appointmentController.getAllAppointments);
app.get("/api/appointments/:id", validateAppointmentID, appointmentController.getAppointmentById);
app.post("/api/appointments", validateAppointment, appointmentController.createAppointment);
app.put("/api/appointments/:id", validateAppointmentID, validateAppointment, appointmentController.updateAppointment);
app.delete("/api/appointments/:id", validateAppointmentID, appointmentController.deleteAppointment);

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
app.post("/api/dailyPlanner", dailyPlannerController.createActivity);
app.put("/api/dailyPlanner/status", dailyPlannerController.updateActivityStatus);

// Panic Button Route
app.post("/api/panicButton", panicButtonController.triggerPanicButton);




// Serve all frontend folders as static
app.use(express.static(path.join(__dirname, 'Medicine')));
app.use(express.static(path.join(__dirname, 'Appointment')));
app.use(express.static(path.join(__dirname, 'Health Journal')));
app.use(express.static(path.join(__dirname, 'Login')));
app.use(express.static(path.join(__dirname, 'SignUp')));
app.use(express.static(path.join(__dirname, 'Journal')));


// Routes
app.post('/login', loginUser);
app.post('/signup', signupUser);

// Medicine Routes
app.get("/api/meds", medsController.getAllDates);
app.get("/api/meds/:id", medsController.getDateById);
app.post("/api/meds", medsController.createDate);
app.put("/api/meds/:id", medsController.updateDate);
app.delete("/api/meds/:id", medsController.deleteDate);

// Appointment Routes
app.get("/api/appointments", appointmentController.getAllAppointments);
app.get("/api/appointments/:id", appointmentController.getAppointmentById);
app.post("/api/appointments", appointmentController.createAppointment);
app.put("/api/appointments/:id", appointmentController.updateAppointment);
app.delete("/api/appointments/:id", appointmentController.deleteAppointment);

// Health Journal Routes
app.get('/health-journal', journalController.GetAllEntries);
app.get('/health-journal/:id', journalController.GetEntryById);
app.post('/health-journal', journalController.CreateEntry);
app.put('/health-journal/:id', journalController.UpdateEntry);
app.delete('/health-journal/:id', journalController.DeleteEntry);

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