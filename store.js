"use strict";

const knex = require('knex')(require('./knexfile'));

module.exports = {
  addResponse ( response ) {
    //  Keep track of which responses were saved and which ones weren't
    let added = [];
    let failed = [];

    for(let question_id in response) {
      console.log(`${question_id} : ${response[question_id]}`);

      //  Check if question_id exists in 'question' table
      let exists = knex.select('id').from('question')
        .where({
          id : question_id
        })
        .then(() => {

        });
        //  If yes, add it to 'responses' table and added[]

        //  If no, only add response it to failed[]

    }
    //  Return added[] and failed[]
    let res = { added, failed };
    return Promise.resolve();
  },

  addQuestion ( content ) {
    console.log(`Add question with content ${content}`);

    let question_id = knex('question')
      .insert({ content })
      .then((id) => {
        return id;        //  Returns id of just inserted question.
      });

    return question_id;
  }
}