const express = require('express');
const cors = require('cors');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

// Import controllers
const { loginUser } = require('./Login/MVC/loginController');
const { signupUser } = require('./SignUp/MVC/signupController');
const medsController = require('./Medicine/MVC/medsController');
const appointmentController = require('./Appointment/MVC/appointmentController');
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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use(express.static(path.join(__dirname, 'appointment')));
app.use(express.static(path.join(__dirname, 'dailyplanner')));
app.use(express.static(path.join(__dirname, 'contacts')));
app.use(express.static(path.join(__dirname, 'profile')));
app.use(express.static(path.join(__dirname, 'Login')));
app.use(express.static(path.join(__dirname, 'SignUp')));
app.use(express.static(path.join(__dirname, 'Journal')));



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await sql.close();
  process.exit(0);
});

module.exports = app;
