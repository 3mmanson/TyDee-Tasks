const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { validateRegister, validateLogin, validateRequestReset, validateResetPassword } = require('../validators/authValidator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/email');
const { query } = require('../models/database');

const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  // POST /api/auth/register - Register a new user
  async register(req, res) {
    try {
      const { error, value } = validateRegister(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const { username, email, password } = value;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });

      // First registered user becomes admin
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      if (userCount[0].count === 1) {
        await query('UPDATE users SET is_admin = 1 WHERE id = ?', [user.id]);
      }

      res.status(201).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // POST /api/auth/login - Authenticate user and return token
  async login(req, res) {
    try {
      const { error, value } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const { email, password } = value;
      const user = await User.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        token,
        data: userWithoutPassword
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // GET /api/auth/me - Get current authenticated user details
  async getMe(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.getById(userId);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, data: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // POST /api/auth/forgot-password - Request password reset token
  async requestPasswordReset(req, res) {
    try {
      const { error, value } = validateRequestReset(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const { email } = value;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      }

      const resetToken = await PasswordResetToken.create(user.id);

      await sendPasswordResetEmail(user.email, resetToken.rawToken);

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // POST /api/auth/reset-password - Reset password with token
  async resetPassword(req, res) {
    try {
      const { error, value } = validateResetPassword(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const { token, password } = value;
      const resetToken = await PasswordResetToken.findByToken(token);

      if (!resetToken) {
        return res.status(400).json({ success: false, error: 'Invalid or expired token' });
      }

      if (new Date(resetToken.expires_at) < new Date()) {
        return res.status(400).json({ success: false, error: 'Token has expired' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updatePassword(resetToken.user_id, hashedPassword);
      await PasswordResetToken.markUsed(token);

      res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

module.exports = authController;
