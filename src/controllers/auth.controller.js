const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const logger = require('../config/logger');
const ApiResponse = require('../utils/apiResponse');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        ApiResponse.error('VALIDATION_ERROR', 'Email and password are required.', 400)
      );
    }

    const admin = config.admins.find((a) => a.email === email);
    if (!admin) {
      logger.warn(`[AUTH] Login attempt with unknown email: ${email}`);
      return res.status(401).json(
        ApiResponse.error('UNAUTHORIZED', 'Invalid credentials.', 401)
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      logger.warn(`[AUTH] Failed login for: ${email}`);
      return res.status(401).json(
        ApiResponse.error('UNAUTHORIZED', 'Invalid credentials.', 401)
      );
    }

    const token = jwt.sign(
      { userId: email, email: admin.email, role: 'admin' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`[AUTH] Successful login for admin: ${email}`);

    res.json(
      ApiResponse.success({
        token,
        user: { email: admin.email, role: 'admin' },
      })
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
