const knexfile = require('../../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);

const Promise = require('bluebird');

module.exports = {
  addQuestion(content, uid) {
    console.log(`Inserting "${content}" with owner "${uid}" into question.`);

    const questionId = knex('question')
      .insert({ content, owner: uid })
      .returning('id')
      .then(id =>
        //  Returns id of just inserted question.
        id[0]);

    return questionId;
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

      for(const item in response) {
        const question_id = response[item].question_id;
        const content = response[item].content;

        // Don't save anything if response content is empty.
        if(!content) continue;

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
          .select(
            knex.raw('?, ?', [
              question_id,
              content,
            ]),
          )
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
        knex(
          knex.raw(
            '?? (??, ??)',
             ['response', 'question_id', 'content'],
          ),
        )
        .insert(selectStatement)
        .then((data) => {
          //  Do something here. The very presence of this .then() function
          //  actually makes the query do its thing.
          return count;
        });
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


  // Delete an array of responses by id
  deleteResponse(ids) {
    console.log(`Deleting responses with the following ids: ${ids}`);
  },


  getUserByKey(key) {
    console.log(`Getting user by key ${key}`);

    const promise = knex('user')
      .select(['id', 'api_key'])
      .where({
        api_key: key,
      })
      .returning(['id', 'api_key']);

    return Promise.resolve(promise);
  },


  userExists(key) {
    const userId = this.getUserByKey(key)[0];

    if (!userId) {
      // User exists
      return userId;
    }
    return false;
  },


  getUsers() {
    const promise = knex('user')
      .select(['id', 'api_key'])
      .returning(['id', 'api_key']);

    return Promise.resolve(promise);
  },

  addUser(apiKey) {
    const userId = this.userExists(apiKey);

    if (!userId) {
      const user = knex('user')
        .insert({ api_key: apiKey })
        .returning('id')
        .then(id =>
          //  Returns id of just inserted user.
          id[0]);

      return user;
    }
    return userId;
  },
};
