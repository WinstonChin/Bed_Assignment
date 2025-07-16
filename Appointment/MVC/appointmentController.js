const appointmentModel = require("./appointmentModel");

// Get all appointments for the logged-in user
async function getAllAppointments(req, res) {
  try {
    const userId = req.user.userId;
    const appointments = await appointmentModel.GetAllAppointments(userId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("getAllAppointments error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

// Get a specific appointment by ID (user-bound)
async function getAppointmentById(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const appointment = await appointmentModel.GetAppointmentById(id, userId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error("getAppointmentById error:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
}

// Create a new appointment for the logged-in user
async function createAppointment(req, res) {
  try {
    const userId = req.user.userId;
    const { clinic, purpose, time } = req.body;
    await appointmentModel.CreateAppointment({ clinic, purpose, time, userId });
    res.status(201).json({ message: "Appointment added" });
  } catch (error) {
    console.error("createAppointment error:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
}

// Update a user’s appointment
async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { clinic, purpose, time } = req.body;
    const updated = await appointmentModel.updateAppointment(id, { clinic, purpose, time, userId });

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    res.status(200).json({ message: "Appointment updated" });
  } catch (error) {
    console.error("updateAppointment error:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
}

// Delete a user’s appointment
async function deleteAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const deleted = await appointmentModel.deleteAppointment(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    console.error("deleteAppointment error:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
