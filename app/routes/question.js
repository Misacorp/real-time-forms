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
  *             content:
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
  *       404:
  *         description: "Couldn't create question for current user. User not found."
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
  *       403:
  *         description: No Authorization header was provided, or header was invalid.
  *       404:
  *         description: "Not found. No question found with specified **id**."
  * /api/question/{question_id}/response:
  *   get:
  *     summary: Get all unique responses to a specific question
  *     description:
  *       "Returns every unique response corresponding to **question_id**."
  *     parameters:
  *       - in: path
  *         name: question_id
  *         schema:
  *           type: integer
  *         required: true
  *         description: Numeric question ID for which to get responses.
  *     tags:
  *       - Response
  *       - Question
  *     responses:
  *       200:
  *         schema:
  *           type: object
  *           properties:
  *             question:
  *               type: object
  *               properties:
  *                 id: integer
  *                 content: string
  *             unique_responses:
  *               type: array
  *               items:
  *                 type: object
  *                 properties:
  *                   content: string
  *                   count: integer
  *         examples:
  *           application/json:
  *             {
  *               "question": {
  *                 "id": 4,
  *                 "content": "What is the spiciest dish you have eaten?"
  *               },
  *               "unique_responses": [
  *                 {
  *                   content: "Mexican noodles. They totally exist.",
  *                   count: 5
  *                 },
  *                 {
  *                   content: "Fireman's Breathmints.",
  *                   count: 2
  *                 },
  *                 {
  *                   content: "Chinese fajitas. They're a thing.",
  *                   count: 1
  *                 }
  *               ]
  *             }
  *       400:
  *         description: "Bad request. Authorization header missing or invalid."
  *       404:
  *         description: "No question found with specified id and provided authorization."
  */


const Celebrate = require('celebrate');
const { Joi } = Celebrate;
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';



  router.route('/')

  // GET ALL QUESTIONS USER HAS ACCESS TO
  .get(
    Celebrate({
      headers: Joi.object().keys({
        'authorization': Joi.string().required()
      }).options({ allowUnknown: true })
    }),
    (req,res,next) => {

    // Store user's API key
    let key = req.headers.authorization;
    if(!key) {
      // If no key was provided, return Forbidden
      res.sendStatus(403);
      return false;
    }

    store
    .getQuestions( key )
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
      headers: Joi.object().keys({
        'authorization': Joi.string().required()
      }).options({ allowUnknown: true }),
      body: Joi.object().keys({
        content: Joi.string().required()
      })
    }),
    // Input has been validated
    (req,res,next) => {

    // Check if user is authorized.
    let key = req.headers.authorization;
    if(!key) {
      // If no key was provided, return Forbidden
      res.sendStatus(403);
      return false;
    }

    // Callback function that sends a successful response when a question is created.
    let callback = function(question_id) {
      // Construct URI where the created resource will be available.
      let uri = '/question/' + question_id;

      // Send response
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Location', uri);
      res.status(201);
      res.send({id : question_id});
    }

    let user_id = '';
    let content = req.body.content;

    // Get user id by API key
    store
      .getUserByKey( key )
      .then((data) => {
        if(data.length < 1) {
          console.log("User doesn't exist yet. Creating...");
          
          // Create new user with key
          store.addUser( key ).then((user_id) => {
            // User created, now create the question
            createQuestion( content, user_id, callback );
            return;
          })
        }
        else {
          // User exists, create the question
          user_id = data[0].id;
          createQuestion( content, user_id, callback );
        }
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

    // Check if user is authorized
    let key = req.headers.authorization;
    if(!key) {
      // If no key was provided, return Forbidden
      res.sendStatus(403);
      return false;
    }

    let qid = req.params.question_id;

    store
    .getQuestion(qid, key)
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





  router.route('/:question_id/response')

  // GET UNIQUE RESPONSES TO QUESTION
  .get(
    // Validate input, returning an error on fail
    Celebrate({
      headers: Joi.object().keys({
        'authorization': Joi.string().required()
      }).options({ allowUnknown: true }),
      params: Joi.object().keys({
        question_id: Joi.number().integer().required()
      })
    }),
    // Input has been validated
    (req,res,next) => {

    // Authorize user
    let key = req.headers.authorization;
    if(!key) {
      // If no key was provided, return Forbidden
      res.sendStatus(403);
      return false;
    }

    let qid = req.params.question_id;

    // Get question data
    let q_content = "";
    store.getQuestion(qid, key)
      .then((data) => {
        if(!data[0]) { 
          // Question not found with provided API key
          res.sendStatus(404);
          return false;
        }
        else {
          // Question found, get responses
          q_content = data[0].content;

          // Get responses
          store
          .getResponses(qid, key)
          .then((data) => {
            if(!data) {
              // No responses found
              res.sendStatus(404);
            }
            else {
              // Responses found
              // Format data into an array
              let arr = [];
              for(let i in data) {
                let response = {
                  content: data[i].content,
                  count: data[i].num
                }
                arr.push(response);
              }

              // Send response
              res.setHeader('Content-Type', 'application/json');
              res.status(200);
              res.send({
                question: {
                  id: qid,
                  content: q_content
                },
                unique_responses: arr
              });
            }
          });
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



function createQuestion(content, user_id, cb) {
  // Request is good. Add an entry.
  store
    .addQuestion(content, user_id, cb)
    .then((question_id) => {
      console.log(`Added question: "${content}" with id: ${question_id}`);
      cb(question_id);
    });
}