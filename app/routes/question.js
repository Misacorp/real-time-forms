const Celebrate = require('celebrate');

const { Joi } = Celebrate;
const store = require('../actions/store');

/**
 * Creates a new question.
 * Creates a user entry for the provided API key if one doesn't exist yet.
 * @param   {string} content Question text content.
 * @param   {string} apiKey  User's API key.
 */
function createNewQuestion(content, apiKey) {
  return new Promise((resolve, reject) => {
    store.addUser(apiKey)
      .then((userId) => {
        store
          .addQuestion(content, userId)
          .then((questionId) => {
            // Question added, return questionID
            resolve(questionId);
          })
          .catch((error) => {
            // Some error
            reject(error);
          });
      });
  });


  // return new Promise((resolve, reject) => {
  //   // Call this function when a question is to be entered.
  //   function saveQuestion(userId) {
  //     // Save question to database
  //     store
  //       .addQuestion(content, userId)
  //       .then((questionId) => {
  //         // Question added, return questionID
  //         resolve(questionId);
  //       })
  //       .catch((error) => {
  //         // Some error
  //         reject(error);
  //       });
  //   }

  //   store
  //     .getUserByKey(apiKey)
  //     .then((userId) => {
  //       console.log(`[question.js] Looked for user with key ${apiKey} and found`, userId);
  //       if (!userId) {
  //         // User doesn't exist.
  //         console.log(`[WARN] User with key ${apiKey} doesn't exist. Creating...`);
  //         store.addUser(apiKey)
  //           .then((id) => {
  //             saveQuestion(id)
  //               .then(questionId => resolve(questionId))
  //               .catch(error => reject(error));
  //           });
  //       } else {
  //         // User exists
  //         console.log(`[OK] User with key ${apiKey} exists!`);
  //         saveQuestion(userId)
  //           .then(questionId => resolve(questionId))
  //           .catch(error => reject(error));
  //       }
  //     });
  // });
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
      (req, res) => {
        // Store user's API key
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.sendStatus(403);
          return false;
        }

        store
          .getQuestions(key)
          .then((data) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200);
            res.json(data);
          });
        return true;
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
      (req, res) => {
        // Check if user is authorized.
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.sendStatus(403);
          return false;
        }

        // Get text content from request body.
        const { content } = req.body;

        // Get user id by API key
        createNewQuestion(content, key)
          .then((questionId) => {
            // Question created successfully. Send HTTP response
            // Construct URI where the created resource will be available.
            const uri = `/api/question/${questionId}`;

            // Send HTTP response
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Location', uri);
            res.status(201);
            res.json({ id: questionId });
          })
          .catch((error) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(500);
            res.json({ error: `Failed to add question ${error}` });
          });
        return true;
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
      (req, res) => {
        // Check if user is authorized
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.sendStatus(403);
          return false;
        }

        const qid = req.params.questionId;

        store
          .getQuestion(qid, key)
          .then((data) => {
            const question = data[0];

            // No data found
            if (!question) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.sendStatus(404);
            } else {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.status(200);
              res.json(question);
            }
          });
        return true;
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
      (req, res) => {
        // Authorize user
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.status(200);
                  res.json({
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
        return true;
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

module.exports.createNewQuestion = createNewQuestion;
