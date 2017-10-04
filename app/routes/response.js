// app/routes/response.js
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';
  // This will handle the url calls for /users/:user_id
  router.route('/:responseId')
  .get(function(req, res, next) {
    // Return user
  }) 
  .put(function(req, res, next) {
    // Update user
  })
  .patch(function(req, res,next) {
    // Patch
  })
  .delete(function(req, res, next) {
    // Delete record
  });

  router.route('/question/:question_id')
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