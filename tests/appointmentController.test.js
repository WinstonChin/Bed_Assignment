const appointmentModel = require('./appointmentModel');
const controller = require('./appointmentController');

jest.mock('./appointmentModel');

describe('Appointment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      body: { clinic: 'Clinic A', purpose: 'Checkup', time: '2025-08-01T10:00' },
      params: { id: '5' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('getAllAppointments - success', async () => {
    appointmentModel.GetAllAppointments.mockResolvedValueOnce([{ id: 1 }]);
    await controller.getAllAppointments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('getAllAppointments - error', async () => {
    appointmentModel.GetAllAppointments.mockRejectedValueOnce(new Error('DB error'));
    await controller.getAllAppointments(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch appointments' });
  });

  test('getAppointmentById - found', async () => {
    appointmentModel.GetAppointmentById.mockResolvedValueOnce({ id: 5 });
    await controller.getAppointmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
  });

  test('getAppointmentById - not found', async () => {
    appointmentModel.GetAppointmentById.mockResolvedValueOnce(null);
    await controller.getAppointmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Appointment not found or unauthorized' });
  });

  test('getAppointmentById - error', async () => {
    appointmentModel.GetAppointmentById.mockRejectedValueOnce(new Error('DB error'));
    await controller.getAppointmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch appointment' });
  });

  // Create appointment
  test('createAppointment - success', async () => {
    appointmentModel.CreateAppointment.mockResolvedValueOnce();
    await controller.createAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Appointment added' });
  });

  test('createAppointment - error', async () => {
    appointmentModel.CreateAppointment.mockRejectedValueOnce(new Error('DB error'));
    await controller.createAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create appointment' });
  });

  // Update appointment
  test('updateAppointment - success', async () => {
    appointmentModel.updateAppointment.mockResolvedValueOnce(true);
    await controller.updateAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Appointment updated' });
  });

  test('updateAppointment - not found', async () => {
    appointmentModel.updateAppointment.mockResolvedValueOnce(false);
    await controller.updateAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Appointment not found or unauthorized' });
  });

  test('updateAppointment - error', async () => {
    appointmentModel.updateAppointment.mockRejectedValueOnce(new Error('DB error'));
    await controller.updateAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update appointment' });
  });

  // Delete appointment
  test('deleteAppointment - success', async () => {
    appointmentModel.deleteAppointment.mockResolvedValueOnce(true);
    await controller.deleteAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Appointment deleted' });
  });

  test('deleteAppointment - not found', async () => {
    appointmentModel.deleteAppointment.mockResolvedValueOnce(false);
    await controller.deleteAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Appointment not found or unauthorized' });
  });

  test('deleteAppointment - error', async () => {
    appointmentModel.deleteAppointment.mockRejectedValueOnce(new Error('DB error'));
    await controller.deleteAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete appointment' });
  });
});
