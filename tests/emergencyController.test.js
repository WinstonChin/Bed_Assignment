const controller = require('../Contacts/MVC/emergencyController');
const emergencyModel = require('../Contacts/MVC/emergencyModel');

jest.mock('../Contacts/MVC/emergencyModel');

describe('Emergency Info Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: 1 },
      body: {
        userId: 1,
        bloodType: "O+",
        allergies: "Peanuts",
        medicalConditions: "Asthma",
        emergencyContactName: "John",
        emergencyContactPhone: "12345678"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('getEmergencyInfo - found', async () => {
    emergencyModel.fetchEmergencyInfo.mockResolvedValueOnce({ userId: 1, bloodType: "O+" });
    await controller.getEmergencyInfo(req, res);
    expect(res.json).toHaveBeenCalledWith({ userId: 1, bloodType: "O+" });
  });

  test('getEmergencyInfo - not found', async () => {
    emergencyModel.fetchEmergencyInfo.mockResolvedValueOnce(null);
    await controller.getEmergencyInfo(req, res);
    expect(res.json).toHaveBeenCalledWith({});
  });

  test('upsertEmergencyInfo - update', async () => {
    emergencyModel.fetchEmergencyInfo.mockResolvedValueOnce({ userId: 1 });
    emergencyModel.updateEmergencyInfo.mockResolvedValueOnce();
    await controller.upsertEmergencyInfo(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Emergency info updated successfully." });
  });

  test('upsertEmergencyInfo - insert', async () => {
    emergencyModel.fetchEmergencyInfo.mockResolvedValueOnce(null);
    emergencyModel.insertEmergencyInfo.mockResolvedValueOnce();
    await controller.upsertEmergencyInfo(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Emergency info saved successfully." });
  });
});
