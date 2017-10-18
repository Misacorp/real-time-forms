/**
  * @swagger
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
      headers: Joi.object().keys({
        'authorization': Joi.string().required()
      }).options({ allowUnknown: true }),
      body: Joi.array().items( 
        Joi.object().keys({
          question_id: Joi.string().required(),
          content: Joi.string().allow('').optional()
        })
      )
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

    let content = req.body;

    // Request is good. Add an entry.
    store
      .addResponses(content, key)
      .then(() => {

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.sendStatus(200);
      });
  });

  router.use(Celebrate.errors());  
};