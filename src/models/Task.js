const db = require('./database');

const TABLE_NAME = 'tasks';

class Task {
  static async getAll(userId) {
    return db(TABLE_NAME).where({ user_id: userId }).orderBy('created_at', 'desc');
  }

  static async getById(id, userId) {
    return db(TABLE_NAME).where({ id, user_id: userId }).first();
  }

  static async create({ title, description, status, userId, priority, due_date }) {
    const [id] = await db(TABLE_NAME).insert({
      title,
      description,
      status: status || 'pending',
      user_id: userId,
      priority: priority || 'Medium',
      due_date: due_date || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });
    return this.getById(id, userId);
  }

  static async update(id, userId, { title, description, status, priority, due_date }) {
    await db(TABLE_NAME)
      .where({ id, user_id: userId })
      .update({
        title,
        description,
        status,
        priority,
        due_date,
        updated_at: db.fn.now()
      });
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    return db(TABLE_NAME).where({ id, user_id: userId }).del();
  }
}

module.exports = Task;
