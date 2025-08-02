const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const loginModel = require("../Login/MVC/loginModel");
const { loginUser, getUserById, updateUser, deleteUser } = require("../Login/MVC/loginController");

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("../Login/MVC/loginModel");

describe("loginUser", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: "test@example.com", password: "pass123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should login successfully and return token", async () => {
    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      name: "Test User",
      profilePicUrl: "pic.jpg"
    };

    loginModel.findUserByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocked-jwt-token");

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Login successful",
      token: "mocked-jwt-token",
      userId: 1,
      name: "Test User",
      email: "test@example.com",
      profilePicUrl: "pic.jpg"
    }));
  });

  it("should return 401 for invalid credentials", async () => {
    loginModel.findUserByEmail.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  it("should return 500 on server error", async () => {
    loginModel.findUserByEmail.mockRejectedValue(new Error("DB failure"));

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Login failed" });
  });
});

describe("getUserById", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return user if found", async () => {
    const user = { id: 1, name: "Test", email: "test@example.com" };
    loginModel.getUserById.mockResolvedValue(user);

    await getUserById(req, res);

    expect(res.json).toHaveBeenCalledWith(user);
  });

  it("should return 404 if user not found", async () => {
    loginModel.getUserById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return 500 on error", async () => {
    loginModel.getUserById.mockRejectedValue(new Error("fail"));

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("updateUser", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      body: {
        name: "Test",
        email: "test@example.com",
        profilePicUrl: "pic.jpg",
        dateOfBirth: "2000-01-01"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should update user and return success message", async () => {
    loginModel.updateUser.mockResolvedValue();

    await updateUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "User updated" });
  });

  it("should return 500 on error", async () => {
    loginModel.updateUser.mockRejectedValue(new Error("fail"));

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Update failed" });
  });
});

describe("deleteUser", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should delete user and return success message", async () => {
    loginModel.deleteUser.mockResolvedValue();

    await deleteUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "User deleted" });
  });

  it("should return 500 on error", async () => {
    loginModel.deleteUser.mockRejectedValue(new Error("fail"));

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Delete failed" });
  });
});