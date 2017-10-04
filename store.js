"use strict";

const knex = require('knex')(require('./knexfile'));
knex.on( 'transaction', function( queryData ) {
    console.log( queryData );
});
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
      .then((id) => {
        return id;        //  Returns id of just inserted question.
      });

    return question_id;
  }
}