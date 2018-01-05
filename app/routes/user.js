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
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.sendStatus(403);
          return false;
        }

        store
          .getUsers()
          .then((data) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(200);
            res.json(data);
          });
        return true;
      },
    );

  router.use(Celebrate.errors());
};
