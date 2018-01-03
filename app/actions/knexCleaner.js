const knexfile = require('../../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);
const knexCleaner = require('knex-cleaner');

module.exports = {
  // Cleans the database
  cleanDatabase() {
    return new Promise((resolve, reject) => {
      try {
        knexCleaner.clean(knex).then(() => {
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  },
};

knexCleaner.clean(knex).then(() => {
  console.log('knexCleaner: Database has been cleaned!');
});
