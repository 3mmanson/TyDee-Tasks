const { query, run } = require('./database');

class User {
  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create({ username, email, password }) {
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO users (username, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [username, email, password, now, now]
    );
    return this.getById(result.lastInsertRowid);
  }

  static async updatePassword(id, hashedPassword) {
    const now = new Date().toISOString();
    return run('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [hashedPassword, now, id]);
  }

  static async getById(id) {
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows[0]) {
      const { password, ...userWithoutPassword } = rows[0];
      return userWithoutPassword;
    }
    return null;
  }
}

module.exports = User;
