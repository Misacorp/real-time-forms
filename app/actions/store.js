"use strict";

const nconf = require('nconf');
const knex = require('knex')(require(nconf.get('knexfile')));
const Promise = require("bluebird");

module.exports = {
  addQuestion ( content ) {
    let question_id = knex('question')
      .insert({ content })
      .returning('id')
      .then((id) => {
        return id[0];        //  Returns id of just inserted question.
      });

    return question_id;
  },


  getQuestions () {
    let promise = knex('question')
      .select(['id','content'])
      .returning(['id','content']);

    return Promise.resolve(promise);
  },


  getQuestion (qid) {
    let promise = knex('question')
      .select(['id','content'])
      .where({
        id: qid
      })
      .returning(['id', 'content']);

    return Promise.resolve(promise);
  },


  addResponses ( response ) {
    return Promise.try(() => {
      for(let item in response) {
        let question_id = response[item].question_id;
        let content = response[item].content;

        // Don't save anything if response content is empty.
        if(!content) continue;

       /*  Loop through each response, adding it to the 'response' table if
        *  its 'question_id' exists in the 'question' table.
        * 
        *  SQL queries in a loop isn't really a good idea, but I have yet
        *  to figure out how to do this with one single query.
        */

        // INSERT INTO response (question_id, content)
        // SELECT '2', 'Vastaus toiseen kysymykseen'
        // FROM question
        // WHERE question.id = '2'

        //  Construct SELECT statement
        let selectStatement = knex.select(
          knex.raw('?, ?', [
            question_id,
            content
          ])
        )
        .from('question')
        .where('question.id', question_id);

        //  Construct INSERT statement
        knex(
          knex.raw(
            '?? (??, ??)',
             ['response', 'question_id', 'content']
          )
        )
        .insert(selectStatement)
        .then(() => {
          //  Do something here. The very presence of this .then() function
          //  actually makes the query do its thing.
        });
      }
    });
  },


  // Get all unique responses to a question by question id (qid)
  getResponses ( qid ) {
    // SELECT DISTINCT content FROM response
    // WHERE question_id = 1;
    let promise = knex('response')
      .select('content')
      .where({
        question_id: qid
      })
      .distinct('content')
      .returning('content');

    return Promise.all(promise);
  },


  // Get a response by response id
  getResponse (id) {
    let promise = knex('response')
      .select(['id','content'])
      .where({
        id: id
      })
      .returning(['id', 'content']);

    return Promise.resolve(promise);
  },
}