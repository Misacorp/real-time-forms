const knexfile = require('../../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);

const Promise = require('bluebird');

module.exports = {
  addQuestion(content, uid) {
    console.log(`Inserting "${content}" with owner "${uid}" into question.`);

    return new Promise((resolve, reject) => {
      knex('question')
        .insert({ content, owner: uid })
        .returning('id')
        .then((id) => {
          //  Returns id of just inserted question.
          console.log(`[store.js / addQuestion] Added question with id: ${id[0]}`);
          resolve(id[0]);
        })
        .catch(error => reject(error));
    });
  },


  // Get questions with a specific API key
  getQuestions(key) {
    const promise = knex('question')
      .join('user', 'question.owner', 'user.id')
      .select(['question.id as id', 'question.content as content'])
      .where({
        api_key: key,
      })
      .returning(['id', 'content']);

    return Promise.resolve(promise);
  },


  getQuestion(qid, key) {
    const promise = knex('question')
      .join('user', 'question.owner', 'user.id')
      .select(['question.id as id', 'question.content as content'])
      .where({
        'question.id': qid,
        api_key: key,
      })
      .returning(['id', 'content']);

    return Promise.resolve(promise);
  },


  addResponses(response, key) {
    return Promise.try(() => {
      let count = 0;

      for (const item in response) {
        const question_id = response[item].question_id;
        const content = response[item].content;

        // Don't save anything if response content is empty.
        if (!content) continue;

        /*  Loop through each response, adding it to the 'response' table if
        *  its 'question_id' exists in the 'question' table AND the question's
        *  owner has the provided 'key'.
        *
        *  SQL queries in a loop isn't really a good idea, but I have yet
        *  to figure out how to do this with one single query.
        */

        // INSERT INTO response (question_id, content)
        // SELECT '2', 'Response to question two'
        // FROM question
        // WHERE question.id = '2'

        //  Construct SELECT statement
        // let promise = knex('question')
        //   .join('user', 'question.owner', 'user.id')
        //   .select(['question.id as id','question.content as content'])
        //   .where({
        //     'question.id': qid,
        //     api_key: key
        //   })
        //   .returning(['id','content']);

        count += 1;

        const selectStatement = knex('question')
          .join('user', 'question.owner', 'user.id')
          .select(knex.raw('?, ?', [
            question_id,
            content,
          ]) )
          .from('question')
          .where({
            'question.id': question_id,
            'user.api_key': key,
          });


        // let selectStatement = knex.select(
        //   knex.raw('?, ?', [
        //     question_id,
        //     content
        //   ])
        // )
        // .from('question')
        // .where({
        //   'question.id', question_id,
        //   ''
        // });

        //  Construct INSERT statement
        knex(knex.raw(
          '?? (??, ??)',
          ['response', 'question_id', 'content'],
        ) )
          .insert(selectStatement)
          .then(data =>
          //  Do something here. The very presence of this .then() function
          //  actually makes the query do its thing.
            console.log(data));
      }
    });
  },


  // Get all unique responses to a question by question id (qid)
  getResponses(qid) {
    // SELECT DISTINCT content FROM response
    // WHERE question_id = 1;
    // let promise = knex('response')
    //   .select('content')
    //   .where({
    //     question_id: qid
    //   })
    //   .distinct('content')
    //   .returning('content');

    // SELECT content, COUNT(content) as num
    // FROM response
    // GROUP BY content
    // ORDER BY num desc
    const promise = knex('response')
      .select('content')
      .count('content as num')
      .where({
        question_id: qid,
      })
      .groupBy('content')
      .orderBy('num', 'desc')
      .returning('content', 'num');

    return Promise.all(promise);
  },


  // Get a response by response id
  getResponse(id) {
    const promise = knex('response')
      .select(['id', 'content'])
      .where({
        id,
      })
      .returning(['id', 'content']);

    return Promise.resolve(promise);
  },


  /**
   * Delete multiple responses.
   * @param {int[]}  ids    An array of response IDs that are to be deleted.
   * @param {string} apiKey API key
   */
  deleteResponses(ids, apiKey) {
    console.log(`Deleting responses with the following ids: ${ids}`);

    const deletedCount = knex.select('response.*').from('response')
      .whereIn('response.id', ids)
      .whereIn('response.question_id', function selectDelRows() {
        this
          .select('question.id')
          .from('question')
          .join('user', 'question.owner', 'user.id')
          .where('user.api_key', apiKey);
      })
      .del();

    return deletedCount;
  },

  /**
   * Returns user by API key
   * @param   {string}  apiKey   API key to search by.
   * @returns {Object}  User data object: {id, apiKey}.
   * @returns {boolean} If no user was found, returns false.
   */
  getUserByKey(apiKey) {
    console.log(`[store.js / getUserByKey] Looking for user with key ${apiKey}`);
    return new Promise((resolve, reject) => {
      knex('user')
        .select(['id', 'api_key'])
        .where({
          api_key: apiKey,
        })
        .returning(['id', 'api_key'])
        .then((userArray) => {
          console.log('[store.js / getUserByKey] Returned the following userArray: ', userArray);
          if (userArray.length > 0) {
            console.log('[store.js / getUserByKey] userArray has entries: ', userArray);
            // Return the first (and only) user match. These keys are unique after all.
            resolve(userArray[0]);
          } else {
            console.log('[store.js / getUserByKey] userArray was empty.');
            resolve(false);
          }
          return true;
        })
        .catch(error => reject(error));
    });
  },


  userExists(key) {
    this.getUserByKey(key)
      .then((userData) => {
        console.log('[store.js / userExists] Resolved with the following data:', userData);
        if (userData) return true;
        return false;
      })
      .catch(error => error);
  },


  getUsers() {
    const promise = knex('user')
      .select(['id', 'api_key'])
      .returning(['id', 'api_key']);

    return Promise.resolve(promise);
  },

  /**
   * Create a new user.
   * @param   {string} apiKey User's API key.
   * @returns {number} User id with the given API key.
   */
  addUser(apiKey) {
    console.log(`[store.js / addUser] Adding user with key ${apiKey}`);
    return new Promise((resolve, reject) => {
      this.getUserByKey(apiKey)
        .then((userData) => {
          console.log('[store.js / addUser] getUserByKey resolved with the following data:', userData);
          if (userData) {
            // User already exists. Return its id.
            resolve(userData.id);
          } else {
            // User doesn't exist with the given key. Create it.
            console.log(`[store.js / addUser] Creating user ${apiKey}`);
            knex('user')
              .insert({ api_key: apiKey })
              .returning('id')
              .then((userIds) => {
                //  Returns id of just inserted user.
                console.log(`[store.js / addUser] Added user ${apiKey} with id ${userIds[0]}`);
                resolve(userIds[0]);
              })
              .catch(e => reject(e));
          }
        })
        .catch((error) => {
          console.log('[store.js / addUser] getUserByKey failed with error: ', error);
          try {
            this.getUserByKey(apiKey)
              .then(userId => resolve(userId));
          } catch (err) {
            console.log('[store.js / addUser] Tried something, but failed');
          }
        });
    });
  },
};
