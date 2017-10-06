"use strict";

const nconf = require('nconf');
const knex = require('knex')(require(nconf.get('knexfile')));
const Promise = require("bluebird");

module.exports = {
  addResponse ( response ) {
    return Promise.try(() => {
      for(let question_id in response) {
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
            response[question_id]
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

  getAnswers( qid ) {
    // SELECT DISTINCT content FROM response
    // WHERE question_id = 1;
    let promise = knex('response')
      .where({
        question_id: qid
      })
      .distinct('content')
      .select()
      .returning('content')
      .catch((e) => {
        return Promise.reject(new Error('fail')
          .then(
            (error) => {},
            (error) => {
            console.log(error);
          }))
      });

    return Promise.all(promise);
  }
}