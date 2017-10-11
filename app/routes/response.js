/**
  * @swagger
  * /api/response/{response_id}:
  *   get:
  *     summary: Get response with given **response_id**
  *     description:
  *       "Returns the **id** and **content** of a single response specified by **response_id**."
  *     parameters:
  *       - in: path
  *         name: response_id
  *         schema:
  *           type: integer
  *         required: true
  *         description: Numeric ID of the response to get.
  *     tags:
  *       - Response
  *     responses:
  *       200:
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               type: integer
  *             content:
  *               type: string
  *         examples:
  *           application/json:
  *             {
  *               "id": 1,
  *               "content": "Mexican noodles. They totally exist."
  *             }
  */


const Celebrate = require('celebrate');
const { Joi } = Celebrate;
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';



  router.route('/')

  // GET ALL QUESTIONS
  .get((req,res,next) => {
    store
    .getResponses()
    .then((data) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(data);
    });
  })

  // CREATE NEW QUESTION
  .post(
    // Validate input, returning an error on fail
    Celebrate({
      body: Joi.object().keys({
        content: Joi.string().required()
      })
    }),
    // Input has been validated
    (req,res,next) => {
    console.log("Responding to POST /question");
    let content = req.body.content;

    // Request is good. Add an entry.
    store
      .addResponse(content)
      .then((question_id) => {
        console.log(`Added question: "${content}" with id: ${question_id}`);

        // Construct URI where the created resource will be available.
        let uri = '/question/' + question_id;

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Location', uri);
        res.status(201);
        res.send({id : question_id});
      });
  });



  router.route('/:question_id')

  // GET SINGLE QUESTION
  .get(
    // Validate input, returning an error on fail
    Celebrate({
      params: Joi.object().keys({
        question_id: Joi.number().integer().required()
      })
    }),
    // Input has been validated
    (req,res,next) => {
    let qid = req.params.question_id;
    console.log(req.params);
    console.log("Getting question " + qid);

    store
    .getResponse(qid)
    .then((data) => {
      data = data[0];
      console.log(data);

      // No data found
      if(!data) {
        res.sendStatus(404);
      }
      // Data found successfully
      else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(data);
      }
    });
  })

  router.use(Celebrate.errors());  
};


  // router.route('/question/:question_id')
  // .get(function(req, res, next) {
  //   let question_id = req.params.question_id;

  //   //  Remove all non-numeric characters
  //   question_id = question_id.replace(/\D/g,'');

  //   store
  //     .getAnswers(question_id)
  //     .then((data) => {
  //       // 'data' is in JSON format: {content : value}.
  //       // Format data into a simple array.
  //       let arr = [];
  //       for(let i=0; i < data.length; i++) {
  //         arr.push(data[i]['content']);
  //       }

  //       res.setHeader('Content-Type', 'application/json');
  //       res.status(200);
  //       res.send({
  //         id: question_id,
  //         responses: arr
  //       });
  //   })
  // })
  // .post(function(req, res, next) {
  // });