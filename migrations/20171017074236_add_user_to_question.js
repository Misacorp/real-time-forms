
exports.up = function(knex, Promise) {
  return knex.schema.table('question', (t) => {
    t.integer('owner')
      .unsigned()
      .notNullable();
    t.foreign('owner')
      .references('user.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('products', (t) => {
    t.dropColumn('owner');
  })
};
