const db = require('./database');
const crypto = require('crypto');

const TABLE_NAME = 'password_reset_tokens';

class PasswordResetToken {
  static async create(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db(TABLE_NAME).where({ user_id: userId }).update({ used: true });

    const [id] = await db(TABLE_NAME).insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
      used: false,
      created_at: db.fn.now()
    });

    return { id, token, expires_at: expiresAt };
  }

  static async findByToken(token) {
    return db(TABLE_NAME).where({ token, used: false }).first();
  }

  static async markUsed(token) {
    return db(TABLE_NAME).where({ token }).update({ used: true });
  }
}

module.exports = PasswordResetToken;
