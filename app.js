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


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'Medicine')));
app.use(express.static(path.join(__dirname, 'Appointment')));
app.use(express.static(path.join(__dirname, 'Health Journal')));
app.use(express.static(path.join(__dirname, 'Login')));
app.use(express.static(path.join(__dirname, 'SignUp')));

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
app.post('/health-journal', jurnalController.CreateEntry);
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

app.post("/api/journal", (req, res, next) => {
  console.log("Received journal entry:", req.body); // Debug log
  next();
}, journalController.createJournalEntry);

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