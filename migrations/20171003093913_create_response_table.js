
exports.up = function(knex, Promise) {
  return knex.schema.createTable('response', (t) => {
    t.increments('id')
      .unsigned()
      .notNullable()
      .primary();
    t.integer('question_id')
      .unsigned()
      .notNullable();
    t.foreign('question_id')
      .references('question.id');
    t.string('content');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('response')
};
