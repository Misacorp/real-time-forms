/* eslint no-param-reassign: 0 */
/* Dredd hooks require the value reassignment of 'transaction' objects */

const hooks = require('hooks');
const knexCleaner = require('../../app/actions/knexCleaner');
const question = require('../../app/routes/question');
const response = require('../../app/routes/response');

const apiKey = 'DREDD';
const adminSecret = 'dev';

let questionCount = 0;
let responseCount = 0;


/* HOOKS HELPER FUNCTIONS */

/**
 * Creates a test question.
 * @param {string} content Text content for this question
 */
function createQuestion(content) {
  // Give questions unique numbers.
  questionCount += 1;
  return new Promise((resolve, reject) => {
    question.createNewQuestion(`${content} ${questionCount}`, apiKey)
      .then((questionId) => { resolve(questionId); })
      .catch((error) => { reject(error); });
  });
}


/**
 * Save an array of responses to their respective questions.
 * @param {Object[]} responseArray An array of responses
 */
function createResponse(responseArray) {
  // Give responses unique numbers.
  responseCount += 1;
  return new Promise((resolve, reject) => {
    response.createNewResponse(responseArray, apiKey)
      .then((storeResponse) => { resolve(storeResponse); })
      .catch((error) => { reject(error); });
  });
}


/* HOOKS */

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
  transaction.request.headers.Authorization = apiKey;

  // Set content-type header
  transaction.request.headers['content-type'] = 'application/json; charset=utf-8';

  // Accept application/json; charset=utf-8
  transaction.request.headers.Accept = 'application/json; charset=utf-8';

  hooks.log(transaction.name);
  done();
});


// Change API key to admin secret for this action
hooks.before('User > /api/user > Get users > 200 > application/json; charset=utf-8', (transaction, done) => {
  transaction.request.headers.Authorization = adminSecret;
  hooks.log(`Dredd: Changed API key to ${adminSecret}`);
  hooks.log(transaction);
  done();
});


// Add a question before responding to it
hooks.before('Response > /api/response > Create new response > 200 > application/json; charset=utf-8', (transaction, done) => {
  const questionsToAdd = 3;
  const questionIds = [];

  (async function loop() {
    for (let i = 0; i < questionsToAdd; i += 1) {
      // Create promises to add questions into an array.
      // The promises will hopefully resolve into question ids.
      // These operations are asynchronous. We are only starting them here.
      questionIds.push(createQuestion('/api/response'));
    }
    await Promise.all(questionIds);
    hooks.log(`questionIds: ${questionIds}`);
    done();
  }());
});


// Add a question before getting one
hooks.before('Question > /api/question/{questionId} > Get a specific question > 200 > application/json; charset=utf-8', (transaction, done) => {
  hooks.log('Adding 5 questions before getting one with /api/question/{questionId}');
  const questionsToAdd = 5;
  const questionIds = [];

  (async function loop() {
    for (let i = 0; i < questionsToAdd; i += 1) {
      // Create promises to add questions into an array.
      // The promises will hopefully resolve into question ids.
      // These operations are asynchronous. We are only starting them here.
      questionIds.push(createQuestion('/api/question/{questionId}'));
    }
    await Promise.all(questionIds);
    hooks.log(`questionIds: ${questionIds}`);
    done();
  }());
});


// Add response before getting it
hooks.before('/api/question/{questionId}/response > Get all unique responses to a specific question > 200 > application/json; charset=utf-8', (transaction, done) => {
  /* 1. Create questions
   * 2. Respond to questions
   * 3. Get responses to these questions
   */

  const questionsToAdd = 3;
  const questionIds = [];
  const responsesToAdd = 5;

  (async function loop() {
    for (let i = 0; i < questionsToAdd; i += 1) {
      // Create promises to add questions into an array.
      // The promises will hopefully resolve into question ids.
      // These operations are asynchronous. We are only starting them here.
      questionIds.push(createQuestion());
    }
    // Wait for async operations to complete, then continue with what we are doing.
    await Promise.all(questionIds);
    // questionIds should now have the ids of our created questions

    // Create responses to the previously created questions
    const responses = [];
    for (let i = 0; i < responsesToAdd; i += 1) {
      const questionIndex = i % questionIds.length;
      hooks.log(`Dredd: Adding response to question ${questionIds[questionIndex]} at position ${questionIndex}`);

      // Push test response to array
      responses.push({
        question_id: questionIds[questionIndex],
        content: `Test response ${responseCount}`,
      });
    }
    const savingResponses = createResponse(responses);
    await savingResponses;

    hooks.log('Dredd: Responses added!');

    // Change URL parameters in the Dredd request to get the responses for a created question.
    // Code here...
    done();
  }());
});
