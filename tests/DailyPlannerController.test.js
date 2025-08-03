const dailyPlannerModel = require('../Daily-Planner/MVC/dailyPlannerModel');
const dailyPlannerController = require('../Daily-Planner/MVC/dailyPlannerController');
const panicButtonModel = require('../PanicButton/MVC/panicButtonModel');
const panicButtonController = require('../PanicButton/MVC/panicButtonController');

jest.mock('../Daily-Planner/MVC/dailyPlannerModel');
jest.mock('../PanicButton/MVC/panicButtonModel');

describe('Daily Planner Controller', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllActivities - success', async () => {
    const req = {
      user: { userId: 1 },
    };
    dailyPlannerModel.GetAllActivities.mockResolvedValueOnce([{ id: 1 }]);
    await dailyPlannerController.getAllActivities(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('getActivityById - not found', async () => {
    const req = {
      user: { userId: 1 },
      params: { id: '999' },
    };
    dailyPlannerModel.getActivityById.mockResolvedValueOnce(null);
    await dailyPlannerController.getActivityById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Activity not found or unauthorized" });
  });

  test('createActivity - error', async () => {
    const req = {
      user: { userId: 1 },
      body: {
        startTime: '08:00',
        endTime: '09:00',
        activity: 'Walk',
      }
    };
    dailyPlannerModel.CreateActivity.mockRejectedValueOnce(new Error('fail'));
    await dailyPlannerController.createActivity(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create activity" });
  });

  test('updateActivity - success', async () => {
    const req = {
      user: { userId: 1 },
      params: { id: '10' },
      body: {
        startTime: '09:00',
        endTime: '10:00',
        activity: 'Jogging'
      }
    };
    dailyPlannerModel.updateActivity.mockResolvedValueOnce(true);
    await dailyPlannerController.updateActivity(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Activity updated" });
  });

  test('deleteActivity - not found', async () => {
    const req = {
      user: { userId: 1 },
      params: { id: '10' },
    };
    dailyPlannerModel.deleteActivity.mockResolvedValueOnce(false);
    await dailyPlannerController.deleteActivity(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Activity not found" });
  });
});

describe('Panic Button Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      body: {
        name: 'John',
        location: 'Home',
        status: 'ongoing',
        userId: 1
      },
      params: { id: '3' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllEmergencies - success', async () => {
    panicButtonModel.GetAllEmergencies.mockResolvedValueOnce([{ id: 1 }]);
    await panicButtonController.getAllEmergencies(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('getEmergencyById - not found', async () => {
    panicButtonModel.getEmergencyById.mockResolvedValueOnce(null);
    await panicButtonController.getEmergencyById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Emergency not found or unauthorized" });
  });

  test('createEmergency - success', async () => {
    panicButtonModel.CreateEmergency.mockResolvedValueOnce();
    await panicButtonController.createEmergency(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Emergency triggered' });
  });

  test('updateEmergency - error', async () => {
    panicButtonModel.updateEmergency.mockRejectedValueOnce(new Error('fail'));
    await panicButtonController.updateEmergency(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to update emergency" });
  });

  test('deleteEmergency - success', async () => {
    panicButtonModel.deleteEmergency.mockResolvedValueOnce(true);
    await panicButtonController.deleteEmergency(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Emergency deleted' });
  });
});
