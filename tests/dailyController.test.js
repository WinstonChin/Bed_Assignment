const moodModel = require('../DailyPlanner/MVC/dailyModel');
const controller = require('../DailyPlanner/MVC/dailyController');

jest.mock('../DailyPlanner/MVC/dailyModel');

describe('Mood Tracker Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: 1, id: 1 },
      body: {
        userId: 1,
        moodId: 1,
        note: 'Feeling good',
        logTimestamp: new Date().toISOString()
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  test('getMoodLogs - success', async () => {
    moodModel.fetchMoodsByUser.mockResolvedValueOnce({ recordset: [{ LogID: 1, MoodName: '😊' }] });
    await controller.getMoodLogs(req, res);
    expect(res.json).toHaveBeenCalledWith([{ LogID: 1, MoodName: '😊' }]);
  });

  test('logMood - success', async () => {
    moodModel.insertMood.mockResolvedValueOnce();
    await controller.logMood(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Mood logged successfully.' });
  });

  test('deleteMoodLog - success', async () => {
    moodModel.deleteMood.mockResolvedValueOnce(true);
    await controller.deleteMoodLog(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Mood log deleted.' }); // ✅ fixed
  });

  test('updateMoodLog - success', async () => {
    moodModel.updateMood.mockResolvedValueOnce(true);
    await controller.updateMoodLog(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Mood log updated.' }); // ✅ fixed
  });
});
