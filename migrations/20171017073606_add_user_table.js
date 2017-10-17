
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', (t) => {
    t.increments('id')
      .unsigned()
      .notNullable()
      .primary();
    t.string('api_key')
      .notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user');
};