/**
  * @swagger
  * /api/response/{response_id}:
  *   get:
  *     summary: Get a specific response
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
  *       404:
  *         description: "No response found with specified id."
  * /api/response/question/{question_id}:
  *   get:
  *     summary: Get all unique responses to a specific question
  *     description:
  *       "Returns an array of unique response **content** to the specified question."
  *     parameters:
  *       - in: path
  *         name: question_id
  *         schema:
  *           type: integer
  *         required: true
  *         description: Numeric question ID for which to get responses.
  *     tags:
  *       - Question
  *       - Response
  *     responses:
  *       200:
  *         schema:
  *           type: object
  *           properties:
  *             content:
  *               type: string
  *         examples:
  *           application/json: [
  *             {
  *               "content": "Mexican noodles. They totally exist."
  *             },
  *             {
  *               "content": "My family has seven dogs and a giraffe."
  *             }
  *           ]
  *       404:
  *         description: "No question found with specified id."
  * /api/response:
  *   post:
  *     summary: Creates new responses
  *     description:
  *       "Creates new responses from an array of response objects. Responses with no **content** are accepted but ignored. Responses with a nonexistant **question_id** are ignored."
  *     tags:
  *       - Response
  *     parameters:
  *       - name: body
  *         in: body
  *         required: true
  *         schema:
  *           type: array
  *           items:
  *             type: object
  *             required:
  *               - question_id
  *             properties:
  *               question_id:
  *                 type: integer
  *               content:
  *                 type: string
  *           example: [
  *             {
  *               "question_id": "3",
  *               "content": "My family has seven dogs and a giraffe."
  *             },
  *             {
  *               "question_id": "7",
  *               "content": "Mexican noodles. They totally exist."
  *             },
  *           ]
  *     responses:
  *       200:
  *         description: "Every response that corresponded to an existing question was recorded. Responses to nonexistant questions are ignored."
  *       400:
  *         description: "Bad request. Question id or content parameters missing."
  */


const Celebrate = require('celebrate');
const { Joi } = Celebrate;
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';



  router.route('/')

  // CREATE NEW RESPONSE
  .post(
    // Validate input, returning an error on fail
    Celebrate({
      body: Joi.array().items( 
        Joi.object().keys({
          question_id: Joi.string().required(),
          content: Joi.string().allow('').optional()
        })
      )
    }),
    // Input has been validated
    (req,res,next) => {
    let content = req.body;

    // Request is good. Add an entry.
    store
      .addResponses(content)
      .then((question_id) => {

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.sendStatus(200);
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