/**
  * @swagger
  * /api/user:
  *   get:
  *     summary: Get all users
  *     description:
  *       Get all users from database
  *     tags:
  *       - User
  *     responses:
  *       200:
  *         description: An array of user ids and their respective API keys.
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               type: integer
  *             api_key:
  *               type: string
  *         examples:
  *           application/json: [
  *             {
  *               "id": 1,
  *               "api_key": "API_KEY_1"
  *             },
  *             {
  *               "id": 2,
  *               "api_key": "API_KEY_2"
  *             }
  *           ]
  *       400:
  *         description: "Bad request. Authorization header missing or empty."
  *       403:
  *         description: "Authorization header does not match API admin secret."
  */


const Celebrate = require('celebrate');
const store = require('../actions/store');

const { Joi } = Celebrate;

module.exports = function userRoute(router) {
  router.route('/')
  // GET ALL USERS
    .get(
      Celebrate({
        headers: Joi.object().keys({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
      }),
      (req, res) => {
        // Check authorization
        const key = req.headers.authorization;
        if (!key || key !== process.env.API_ADMIN_SECRET) {
          // If no key was provided, return Forbidden
          res.setHeader('Content-Type', 'application/json');
          res.sendStatus(403);
          return false;
        }

        store
          .getUsers()
          .then((data) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.send(data);
          });
        return true;
      },
    );

  router.use(Celebrate.errors());
};
