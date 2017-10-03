"use strict";

const knex = require('knex')(require('./knexfile'));

module.exports = {
  addResponse ( response ) {
    for(let item in response) {
      console.log(`${item} : ${response[item]}`);
    }
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