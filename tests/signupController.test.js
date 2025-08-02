const bcrypt = require("bcryptjs");
const signupModel = require("../SignUp/MVC/signupModel");
const { signupUser } = require("../SignUp/MVC/signupController");

jest.mock("bcryptjs");
jest.mock("../SignUp/MVC/signupModel");


describe("signupUser", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { name: "Test", email: "test@example.com", password: "pass123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should create user if email not taken", async () => {
    signupModel.findUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    signupModel.createUser.mockResolvedValue();

    await signupUser(req, res);

    expect(signupModel.findUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("pass123", 10);
    expect(signupModel.createUser).toHaveBeenCalledWith("Test", "test@example.com", "hashedPassword");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "User created successfully" });
  });

  it("should return 409 if user already exists", async () => {
    signupModel.findUserByEmail.mockResolvedValue({ id: 1 });

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
  });

  it("should return 500 on error", async () => {
    signupModel.findUserByEmail.mockRejectedValue(new Error("fail"));

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Signup failed" });
  });
});