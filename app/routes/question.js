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
  *         description: "An array of question ids and their text representations."
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
  * /api/question/{questionId}:
  *   get:
  *     summary: Get a specific question
  *     description:
  *       "Returns the **id** and **content** of the specified question."
  *     tags:
  *       - Question
  *     parameters:
  *       - in: path
  *         name: questionId
  *         type: integer
  *         required: true
  *         description: Numeric ID of the question to get.
  *     responses:
  *       200:
  *         description: "A question id and its text representation."
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
  * /api/question/{questionId}/response:
  *   get:
  *     summary: Get all unique responses to a specific question
  *     description:
  *       "Returns every unique response corresponding to **questionId**."
  *     parameters:
  *       - in: path
  *         name: questionId
  *         type: integer
  *         required: true
  *         description: Numeric question ID for which to get responses.
  *     tags:
  *       - Response
  *       - Question
  *     responses:
  *       200:
  *         description: "The requested question object and all unique responses to that question.
  *                       The amount of each response is included."
  *         schema:
  *           type: object
  *           properties:
  *             question:
  *               type: object
  *               properties:
  *                 id:
  *                   type: integer
  *                 content:
  *                   type: string
  *             unique_responses:
  *               type: array
  *               items:
  *                 type: object
  *                 properties:
  *                   content:
  *                     type: string
  *                   count:
  *                     type: integer
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


function createQuestion(content, userId, cb) {
  // Request is good. Add an entry.
  store
    .addQuestion(content, userId, cb)
    .then((questionId) => {
      console.log(`Added question: "${content}" with id: ${questionId}`);
      cb(questionId);
    });
}


module.exports = function questionRoute(router) {
  router.route('/')

  // GET ALL QUESTIONS USER HAS ACCESS TO
    .get(
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
      }),
      (req, res, next) => {
        // Store user's API key
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.sendStatus(403);
          return false;
        }

        store
          .getQuestions(key)
          .then((data) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.send(data);
          });
      },
    )

  // CREATE NEW QUESTION
    .post(
    // Validate input, returning an error on fail
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        body: Joi.object().keys({
          content: Joi.string().required(),
        }),
      }),
      // Input has been validated
      (req, res, next) => {
        // Check if user is authorized.
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.sendStatus(403);
          return false;
        }

        // Callback function that sends a successful response when a question is created.
        const callback = function returnQuestion(questionId) {
          // Construct URI where the created resource will be available.
          const uri = `/question/${questionId}`;

          // Send response
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Location', uri);
          res.status(201);
          res.send({ id: questionId });
        };

        let userId = '';
        const content = req.body.content;

        // Get user id by API key
        store
          .getUserByKey(key)
          .then((data) => {
            if (data.length < 1) {
              console.log("User doesn't exist yet. Creating...");

              // Create new user with key
              store.addUser(key).then((userId) => {
                // User created, now create the question
                createQuestion(content, userId, callback);
              });
            } else {
              // User exists, create the question
              userId = data[0].id;
              createQuestion(content, userId, callback);
            }
          });
      },
    );


  router.route('/:questionId')

  // GET SINGLE QUESTION
    .get(
    // Validate input, returning an error on fail
      Celebrate({
        params: Joi.object().keys({
          questionId: Joi.number().integer().required(),
        }),
      }),
      // Input has been validated
      (req, res, next) => {
        // Check if user is authorized
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.sendStatus(403);
          return false;
        }

        const qid = req.params.questionId;

        store
          .getQuestion(qid, key)
          .then((data) => {
            const question = data[0];
            console.log(question);

            // No data found
            if (!question) {
              res.sendStatus(404);
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.status(200);
              res.send(question);
            }
          });
      },
    );


  router.route('/:questionId/response')

  // GET UNIQUE RESPONSES TO QUESTION
    .get(
    // Validate input, returning an error on fail
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        params: Joi.object().keys({
          questionId: Joi.number().integer().required(),
        }),
      }),
      // Input has been validated
      (req, res, next) => {
        // Authorize user
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.sendStatus(403);
          return false;
        }

        const qid = req.params.questionId;

        // Get question data
        let questionContent = '';
        store.getQuestion(qid, key)
          .then((data) => {
            if (!data[0]) {
              // Question not found with provided API key
              res.sendStatus(404);
              return false;
            }

            // Question found, get responses
            questionContent = data[0].content;

            // Get responses
            store
              .getResponses(qid, key)
              .then((responseData) => {
                if (!responseData) {
                  // No responses found
                  res.sendStatus(404);
                } else {
                  // Responses found
                  // Format responseData into an array
                  const arr = [];
                  for (let i = 0; i < responseData.length; i += 1) {
                    const response = {
                      content: responseData[i].content,
                      count: responseData[i].num,
                    };
                    arr.push(response);
                  }

                  // Send response
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200);
                  res.send({
                    question: {
                      id: qid,
                      content: questionContent,
                    },
                    unique_responses: arr,
                  });
                }
              });
            return true;
          });
      },
    );

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
