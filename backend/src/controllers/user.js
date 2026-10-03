const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { users } = require("../../models");
require("dotenv").config();

// ─── Register ────────────────────────────────────────────────────────────────

const userFinalReg = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const findUser = await users.findOne({ where: { email } });

    if (findUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const newUser = await users.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "user",
    });

    return res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const getUser = await users.findOne({ where: { email } });

    if (!getUser) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, getUser.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: "error",
        message: "Token is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: getUser.id,
        role: getUser.role,
        name: getUser.name,
        email: getUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      details: {
        id: getUser.id,
        name: getUser.name,
        email: getUser.email,
        role: getUser.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────

const getUsers = async (req, res) => {
  try {
    const allUsers = await users.findAll({
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      status: "success",
      data: allUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// ─── Get Single User ──────────────────────────────────────────────────────────

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// ─── Update User ──────────────────────────────────────────────────────────────

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await users.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // If changing email, check for duplicates
    if (email && email !== user.email) {
      const existingEmail = await users.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          status: "error",
          message: "Email already in use",
        });
      }
    }

    await user.update({ name, email, phone, role });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await users.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  userFinalReg,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
