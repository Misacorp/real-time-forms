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
 * @param   {string} content Text content for this question
 * @returns {int}    Id of the created question  
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
function createResponses(responseArray) {
  // Give responses unique numbers.
  responseCount += 1;
  return new Promise((resolve, reject) => {
    response.createNewResponse(responseArray, apiKey)
      .then(() => { resolve(); })
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

/**
 * GET: User > Get users
 * /api/user/
 * Change API key to admin secret before getting users (only admin can get a list of users).
 */
hooks.before('User > /api/user > Get users > 200 > application/json; charset=utf-8', (transaction, done) => {
  transaction.request.headers.Authorization = adminSecret;
  hooks.log(`Dredd: Changed API key to ${adminSecret}`);
  done();
});


/**
 * POST: Response > Create new response
 * /api/response
 * Add new questions before creating responses.
 */
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


/**
 * DELETE: Response > Create new response
 * /api/response
 * Delete an array of responses by id.
 */
hooks.before('Response > /api/response > Delete responses > 200 > application/json; charset=utf-8', (transaction, done) => {
  /**
   * Before deleting responses, do the following:
   * 1. Create a question
   * 2. Create responses to question
   */
  const responsesToAdd = 5;
  const responses = [];

  const newQuestion = createQuestion('DELETE /api/response');
  newQuestion.then((questionId) => {
    hooks.log(`(DELETE RESPONSE) Created a question with id ${questionId}`);
    // Populate an array with response objects
    for (let i = 0; i < responsesToAdd; i += 1) {
      responses.push({
        question_id: questionId,
        content: `Deletion test answer ${i}`,
      });
    }
    // Submit those responses
    const newResponses = createResponses(responses);
    newResponses.then((/* Need to get added response IDs from response.js for this */) => {
      // Store the returned response IDs for later use.
      done();
    });
  });

  /**
  * After deleting responses, do the following:
  * 1. Make sure responses were deleted
  * 2. Make sure no responses were deleted from other users. (This is a bit more complex).
  */
});


/**
 * GET: Question > Get a specific question
 * /api/question/{questionId}
 * Add new questions before getting questions.
 */
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


/**
 * POST: Question > Get all unique responses to a specific question
 * /api/question/{questionId}/response
 * Add a new questions and responses before getting their responses.
 */
hooks.before('Question > /api/question/{questionId}/response > Get all unique responses to a specific question > 400 > application/json; charset=utf-8', (transaction, done) => {
  // Set how many questions and responses we're going to create.
  const questionsToAdd = 3;
  const questions = [];
  const questionIds = [];
  const responsesToAdd = 5;

  (async function loop() {
    for (let i = 0; i < questionsToAdd; i += 1) {
      // Create promises to add questions into an array.
      // These operations are asynchronous. We are only starting them here.
      questions.push(createQuestion('/api/question/{questionId}/response'));
    }
    // Wait for async operations to complete, then continue with what we are doing.
    await Promise.all(questions)
      .then((results) => {
        results.forEach((item) => {
          questionIds.push(item);
        });
      });

    // The questions array contains Promise objects. Let's get the returned questionIds from them.

    // Create responses to the previously created questions
    const responses = [];
    for (let i = 0; i < responsesToAdd; i += 1) {
      const questionIndex = i % questionIds.length;
      hooks.log(`Dredd: Adding response to question ${questionIds[questionIndex]} at position ${questionIndex}`);

      // Push test response to array
      responses.push({
        question_id: questionIds[questionIndex],
        content: `Test response ${i}`,
      });
    }
    const savingResponses = createResponses(responses);
    await savingResponses;

    hooks.log('Dredd: Responses added!');

    // Change URL parameters in the Dredd request to get the responses for a created question.
    // Code here...
    done();
  }());
});
