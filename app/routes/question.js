/**
  * @swagger
  * /api/question:
  *   put:
  *     summary: Creates a new question
  *     description:
  *       "Creates a new question, returning the newly created question **id**."
  *     tags:
  *       - Question
  *     parameters:
  *       - name: body
  *         in: body
  *         required: true
  *         schema:
  *           type: object
  *           required:
  *             - content
  *           properties:
  *             username:
  *               type: string
  *           example: {
  *             "content": "What is the spiciest dish you have eaten?"
  *           }
  *     responses:
  *       201:
  *         description: "201: Created"
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               type: integer
  *         examples:
  *           application/json: {
  *             "id": 2
  *           }
  */


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
  .put((req,res,next) => {
    //  Sanitize input data somehow?
    let content = req.body.content;

    //  Store in database
    store
      .addQuestion(content)
      .then((question_id) => {
        console.log(`Added question: "${content}" with id: ${question_id}`)

        res.setHeader('Content-Type', 'application/json');
        res.status(201);
        res.send({id : question_id});
      });
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