// app/routes/response.js
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';

  router.route('/')
  .get((req,res,next) => {
    //  Get all questions
    store
    .getQuestions()
    .then((data) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(data);
    });
  })
  .post((req,res,next) => {
    //  Add new question
  });

  router.route('/responses/:question_id')
  .get(function(req, res, next) {
    let question_id = req.params.question_id;

    //  Remove all non-numeric characters
    question_id = question_id.replace(/\D/g,'');

    store
      .getAnswers(question_id)
      .then((data) => {
        // 'data' is in JSON format: {content : value}.
        // Format data into a simple array.
        let arr = [];
        for(let i=0; i < data.length; i++) {
          arr.push(data[i]['content']);
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send({
          id: question_id,
          responses: arr
        });
    })
  })
  .post(function(req, res, next) {
  });

  
};