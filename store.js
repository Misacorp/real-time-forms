"use strict";

const knex = require('knex')(require('./knexfile'));
const Promise = require("bluebird");

module.exports = {
  addResponse ( response ) {
    let data = [];

    //  Loop through each input
    for(let question_id in response) {
      console.log(`${question_id} : ${response[question_id]}`);
      data.push({
        question_id : question_id,
        content: response[question_id]
      });

      // Add to 'response' table if question_id exists in 'question' table
      // INSERT INTO response (question_id, content)
      // SELECT '2', 'Vastaus toiseen kysymykseen'
      // FROM question
      // WHERE question.id = '2'
      // knex('response')
      //   .returning('id')
      //   .insert({question_id: question_id}, {content: response[question_id]});
    }

    console.log(data);

    data = [
      { question_id: '1', content: 'Vastaus 1' },
      { question_id: '2', content: 'Vastaus 2' },
      { question_id: '3', content: 'Vastaus 3' },
      { question_id: '4', content: 'Vastaus 4' }
    ];

    return Promise.try(() => {
      knex.transaction((t) => {
        return knex('response')
          .transacting(t)
          .insert(data)
          .then(t.commit)
          .catch(t.rollback)
      })
      .then(() => {
        return "success";
      })
      .catch((e) => {
        throw e;
      })
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