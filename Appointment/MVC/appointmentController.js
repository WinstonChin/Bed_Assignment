const appointmentModel = require("./appointmentModel");

async function getAllAppointments(req, res) {
  try {
    const appointments = await appointmentModel.GetAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

async function getAppointmentById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const appointment = await appointmentModel.GetAppointmentById(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
}

async function createAppointment(req, res) {
  try {
    const { clinic, purpose, time } = req.body;
    await appointmentModel.CreateAppointment({ clinic, purpose, time });
    res.status(201).json({ message: "Appointment added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
}

async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { clinic, purpose, time } = req.body;
    await appointmentModel.updateAppointment(id, { clinic, purpose, time });
    res.status(200).json({ message: "Appointment updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
}

async function deleteAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await appointmentModel.deleteAppointment(id);
    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
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
