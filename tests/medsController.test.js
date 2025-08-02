const medsModel = require("../Medicine/MVC/medsModel");
const {
  getAllDates,
  getDateById,
  createDate,
  updateDate,
  deleteDate,
} = require("../Medicine/MVC/medsController");

jest.mock("../Medicine/MVC/medsModel");

describe("medsController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      params: { id: "2" },
      body: { medicine: "Aspirin", datetime: "2025-08-03T10:00:00Z" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getAllDates", () => {
    it("should return all meds for user", async () => {
      medsModel.GetAllDates.mockResolvedValue([{ id: 1, medicine: "Aspirin" }]);
      await getAllDates(req, res);
      expect(medsModel.GetAllDates).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, medicine: "Aspirin" }]);
    });

    it("should handle errors", async () => {
      medsModel.GetAllDates.mockRejectedValue(new Error("fail"));
      await getAllDates(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch meds" });
    });
  });

  describe("getDateById", () => {
    it("should return med if found", async () => {
      medsModel.getDateById.mockResolvedValue({ id: 2, medicine: "Aspirin" });
      await getDateById(req, res);
      expect(medsModel.getDateById).toHaveBeenCalledWith(2, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 2, medicine: "Aspirin" });
    });

    it("should return 404 if not found", async () => {
      medsModel.getDateById.mockResolvedValue(null);
      await getDateById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Reminder not found or unauthorized" });
    });

    it("should handle errors", async () => {
      medsModel.getDateById.mockRejectedValue(new Error("fail"));
      await getDateById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch reminder" });
    });
  });

  describe("createDate", () => {
    it("should create a new reminder", async () => {
      medsModel.CreateDate.mockResolvedValue();
      await createDate(req, res);
      expect(medsModel.CreateDate).toHaveBeenCalledWith({
        medicine: "Aspirin",
        datetime: "2025-08-03T10:00:00Z",
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Reminder added" });
    });

    it("should handle errors", async () => {
      medsModel.CreateDate.mockRejectedValue(new Error("fail"));
      await createDate(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to create reminder" });
    });
  });

  describe("updateDate", () => {
    it("should update reminder if found", async () => {
      medsModel.updateDate.mockResolvedValue(true);
      await updateDate(req, res);
      expect(medsModel.updateDate).toHaveBeenCalledWith(2, {
        medicine: "Aspirin",
        datetime: "2025-08-03T10:00:00Z",
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Reminder updated" });
    });

    it("should return 404 if not found", async () => {
      medsModel.updateDate.mockResolvedValue(false);
      await updateDate(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Reminder not found or unauthorized" });
    });

    it("should handle errors", async () => {
      medsModel.updateDate.mockRejectedValue(new Error("fail"));
      await updateDate(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to update reminder" });
    });
  });

  describe("deleteDate", () => {
    it("should delete reminder if found", async () => {
      medsModel.deleteDate.mockResolvedValue(true);
      await deleteDate(req, res);
      expect(medsModel.deleteDate).toHaveBeenCalledWith(2, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Reminder deleted" });
    });

    it("should return 404 if not found", async () => {
      medsModel.deleteDate.mockResolvedValue(false);
      await deleteDate(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Reminder not found or unauthorized" });
    });

    it("should handle errors", async () => {
      medsModel.deleteDate.mockRejectedValue(new Error("fail"));
      await deleteDate(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete reminder" });
    });
  });
});