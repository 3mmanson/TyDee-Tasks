exports.up = function(knex) {
  return knex.schema.table('tasks', (table) => {
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('priority', ['Low', 'Medium', 'High']).defaultTo('Medium');
    table.date('due_date').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('tasks', (table) => {
    table.dropColumn('user_id');
    table.dropColumn('priority');
    table.dropColumn('due_date');
  });
};
