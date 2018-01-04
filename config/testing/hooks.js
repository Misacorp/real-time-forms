const hooks = require('hooks');
const store = require('../../app/actions/store');
const knexCleaner = require('../../app/actions/knexCleaner');

const apiKey = 'DREDD';
let questionCount = 0;

function createQuestion() {
  questionCount += 1;
  return store.addQuestion(`Test question ${questionCount}`, apiKey);
}

hooks.beforeAll((transactions, done) => {
  hooks.log('Dredd: Cleaning database');
  knexCleaner.cleanDatabase()
    .then(() => {
      hooks.log('Dredd: Database cleaned!');
      done();
    })
    .catch((err) => {
      hooks.log(`Dredd: Database cleaning failed with error: ${err}`);
    });
});

hooks.beforeEach((transaction, done) => {
  // Add authorization header to transaction
  hooks.log('Dredd: Adding API key to request');
  transaction.request.headers.Authorization = apiKey;
  transaction.request.headers['content-type'] = 'application/json; charset=utf-8';
  done();
});

// Add a question before responding to it
hooks.before('/api/response/', (transaciton, done) => {
  for (let i = 0; i < 3; i += 1) {
    createQuestion();
  }
  done();
});

// Add a question before getting one
hooks.before('/api/question/{questionId}', (transactions, done) => {
  createQuestion();
  done();
});
