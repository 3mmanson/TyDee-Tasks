const { query, run } = require('./database');
const crypto = require('crypto');

class PasswordResetToken {
  static async create(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await run('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [userId]);

    const result = await run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)',
      [userId, token, expiresAt, new Date().toISOString()]
    );

    return { id: result.lastInsertRowid, token, expires_at: expiresAt };
  }

  static async findByToken(token) {
    const rows = await query('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0', [token]);
    return rows[0] || null;
  }

  static async markUsed(token) {
    return run('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);
  }
}

module.exports = PasswordResetToken;
