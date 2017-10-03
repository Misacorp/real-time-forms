
exports.up = function(knex, Promise) {
  return knex.schema.createTable('question', (t) => {
    t.increments('id').primary();
    t.string('content');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('question')
};
