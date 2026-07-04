const db = require('./database');

const TABLE_NAME = 'users';

class User {
  static async findByEmail(email) {
    return db(TABLE_NAME).where({ email }).first();
  }

  static async findByUsername(username) {
    return db(TABLE_NAME).where({ username }).first();
  }

  static async create({ username, email, password }) {
    const [id] = await db(TABLE_NAME).insert({
      username,
      email,
      password,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });
    return this.getById(id);
  }

  static async updatePassword(id, hashedPassword) {
    return db(TABLE_NAME).where({ id }).update({
      password: hashedPassword,
      updated_at: db.fn.now()
    });
  }

  static async getById(id) {
    const user = await db(TABLE_NAME).where({ id }).first();
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}

module.exports = User;
