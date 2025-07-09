const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginModel = require("./loginModel");

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await loginModel.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { loginUser };
