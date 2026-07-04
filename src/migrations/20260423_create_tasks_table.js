exports.up = function(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'in_progress', 'completed']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
};
