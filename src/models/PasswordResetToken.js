const { query, run } = require('./database');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class PasswordResetToken {
  static async create(userId) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await run('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [userId]);

    const result = await run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)',
      [userId, hashedToken, expiresAt, new Date().toISOString()]
    );

    // TODO: Send rawToken via email service instead of returning it
    return { id: result.lastInsertRowid, rawToken, expires_at: expiresAt };
  }

  static async findByToken(token) {
    const rows = await query('SELECT * FROM password_reset_tokens WHERE used = 0');
    for (const row of rows) {
      if (await bcrypt.compare(token, row.token)) {
        return row;
      }
    }
    return null;
  }

  static async markUsed(token) {
    return run('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);
  }
}

module.exports = PasswordResetToken;
