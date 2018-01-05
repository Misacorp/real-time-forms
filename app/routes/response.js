const Celebrate = require('celebrate');

const { Joi } = Celebrate;
const store = require('../actions/store');

/**
 * Save an array of responses to their respective questions.
 * @param {Object[]} responses               An array of responses
 * @param {int}      responses[].question_id Question id to which the response is for
 * @param {string}   responses[].content     Text content of this response
 * @param {string}   apiKey                  API key
 */
function createNewResponse(responses, apiKey) {
  return new Promise((resolve, reject) => {
    // Store the response object
    store
      .addResponses(responses, apiKey)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}


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
      (req, res) => {
        // Authorize user
        const key = req.headers.authorization;
        if (!key) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.sendStatus(403);
          return false;
        }

        // Request is good. Add an entry
        const responses = req.body;

        const newResponse = createNewResponse(responses, key);
        newResponse
          .then(() => {
            // Send response
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200);
            res.json({ status: 'success' }); // Get some more descriptive information?
          })
          .catch((error) => {
            console.log(req.body);
            console.log(`Response addition failed with error ${error}`);
          });

        return true;
      },
    )

  // DELETE A RESPONSE
    .delete(
      // Validate input. Authorization and response ID array required.
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        body: Joi.array().items(Joi.number().integer().required()),
      }),
      // Input has been validated
      (req, res) => {
        // Authorize user
        const key = req.headers.authorization;
        if (!key) {
          // This is rather redundant with Joi validation, right?
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json');
          res.sendStatus(403);
          return false;
        }

        const responseIds = req.body;
        store
          .deleteResponses(responseIds, key)
          .then((count) => {
            console.log('Deleted ', count);
            // Send response
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.json(count);
          })
          .catch((error) => {
            console.log(error);
          });

        return true;
      },
    );

  router.use(Celebrate.errors());
};

module.exports.createNewResponse = createNewResponse;
