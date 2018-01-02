/**
  * @swagger
  * /api/response:
  *   post:
  *     summary: Creates new responses
  *     description:
  *       "Creates new responses from an array of response objects.
  *        Responses with no **content** are accepted but ignored.
  *        Responses with a nonexistant **question_id** are ignored."
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
  *         description: "Every response that corresponded to an existing question was recorded.
  *          Responses to nonexistant questions are ignored."
  *       400:
  *         description: "Bad request. Question id or content parameters missing."
  *   delete:
  *     summary: Deletes a response
  *     description:
  *       "Deletes an array of responses."
  *     tags:
  *       - Response
  *     parameters:
  *       - name: response_array
  *         in: body
  *         required: true
  *         schema:
  *           type: array
  *           items:
  *             type: integer
  *           example: [1,12,42]
  *     responses:
  *       200:
  *         description: "Every response that corresponded to an existing question was recorded.
  *          Responses to nonexistant questions are ignored."
  *       400:
  *         description: "Bad request. Question id or content parameters missing."
  */


const Celebrate = require('celebrate');

const { Joi } = Celebrate;
const store = require('../actions/store');

module.exports = function responseRoute(router) {
  router.route('/')

  // CREATE NEW RESPONSE
    .post(
    // Validate input, returning an error on fail
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        body: Joi.array().items(Joi.object().keys({
          question_id: Joi.number().integer().required(),
          content: Joi.string().allow('').optional(),
        })),
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

        const content = req.body;

        // Request is good. Add an entry.
        store
          .addResponses(content, key)
          .then(() => {
            // Send response
            res.setHeader('Content-Type', 'application/json');
            res.sendStatus(200);
          });
        return true;
      },
    )

  // DELETE A RESPONSE
    .delete(
      // Validate input. Authorization and response Id required.
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        body: Joi.array().items(Joi.number().integer().required()),
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

        const responseIds = req.body;
        store
          .deleteResponse()
          .then((result) => {
            // Send response
            res.setHeader('Content-Type', 'application/json');
            res.sendStatus(200);
            console.log(result);
          });

        return true;
      },
    );

  router.use(Celebrate.errors());
};
