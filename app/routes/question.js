/**
  * @swagger
  * /api/question:
  *   get:
  *     summary: Gets all created questions
  *     description:
  *       "Returns the **id** and **content** of every available question in array format."
  *     tags:
  *       - Question
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
  *           application/json: [
  *             {
  *               "id": 1,
  *               "content": "What is the spiciest dish you have eaten?"
  *             },
  *             {
  *               "id": 2,
  *               "content": "How many yellow books have you read?"
  *             }
  *           ]
  *   post:
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
  *         description: "Resource created and available through location header URI."
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               type: integer
  *         examples:
  *           application/json: {
  *             "id": 2
  *           }
  *       400:
  *         description: "Bad request. Content parameter missing or empty."
  * /api/question/{question_id}:
  *   get:
  *     summary: Get a specific question
  *     description:
  *       "Returns the **id** and **content** of the specified question."
  *     tags:
  *       - Question
  *     parameters:
  *       - in: path
  *         name: question_id
  *         schema:
  *           type: integer
  *         required: true
  *         description: Numeric ID of the question to get.
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
  *               "content": "What is the spiciest dish you have eaten?"
  *             }
  *       404:
  *         description: "Not found. No question found with specified **id**."
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
    .getQuestions()
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
      .addQuestion(content)
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
    .getQuestion(qid)
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

  // UPDATE QUESTION
  // Don't implement this before authentication.
  // .patch(function(req, res, next) {
  // })

  // DELETE QUESTION
  // Don't implement this before authentication.
  // .delete(function(req, res, next) {
  // });



  router.use(Celebrate.errors());  
};
