
exports.up = function (knex) {
  return knex.schema.alterTable('user', (t) => {
    t.unique('api_key');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('user', (t) => {
    t.dropUnique('api_key');
  });
};
