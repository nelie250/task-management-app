const express = require("express");
const User = require("../models/User");
const {
  generateTokens,
  verifyRefreshToken,
  authMiddleware,
} = require("../middleware/auth");

const router = express.Router();

const normalizeUsername = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// Validate password strength
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password))
    errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*]/.test(password))
    errors.push(
      "Password must contain at least one special character (!@#$%^&*)",
    );
  return errors;
};

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Name, username, email, and password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const passwordErrors = validatePassword(String(password));
    if (passwordErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Password too weak", errors: passwordErrors });
    }

    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This username or email is already taken." });
    }

    const user = await User.create({
      name: String(name).trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role: "member",
    });

    const { token, refreshToken } = generateTokens(
      user._id,
      user.username,
      user.role,
    );

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const normalizedUsername = normalizeUsername(username);
    const user = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedUsername }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const { token, refreshToken } = generateTokens(
      user._id,
      user.username,
      user.role,
    );

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id || decoded.type !== "refresh") {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Verify refresh token is in user's list
    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshToken,
    );
    if (!tokenExists) {
      return res.status(401).json({ message: "Refresh token not found." });
    }

    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.username,
      user.role,
    );

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken,
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    return res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(500)
      .json({ message: "Token refresh failed", error: error.message });
  }
});

// Logout endpoint
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (rt) => rt.token !== refreshToken,
        );
        await user.save();
      }
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
