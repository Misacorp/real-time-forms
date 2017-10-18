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
  *   post:
  *     summary: Creates a new user
  *     description:
  *       Creates a new user
  *     tags:
  *       - User
  *     parameters:
  *       - name: body
  *         in: body
  *         required: true
  *         schema:
  *           type: object
  *           required:
  *             - api_key
  *           properties:
  *             api_key:
  *               type: string
  *           example: {
  *             "api_key": "API_KEY_1"
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
  *         description: "Bad request. Authorization header missing or empty."
  * /api/user/{api_key}:
  *   get:
  *     summary: Get a user by API key
  *     description:
  *       Get a single user based on a given API key
  *     tags:
  *       - User
  *     parameters:
  *       - in: path
  *         name: api_key
  *         schema:
  *           type: string
  *         required: true
  *         description: User's API key
  *     responses:
  *       200:
  *         schema:
  *           type: object
  *           properties:
  *             api_key:
  *               type: string
  *         examples:
  *           application/json:
  *             {
  *               "id": 1,
  *               "api_key": "API_KEY_1"
  *             }
  *       404:
  *         description: No user was found with provided API key.
  */


const Celebrate = require('celebrate');
const { Joi } = Celebrate;
const store = require('../actions/store');

module.exports = function(router) {
  'use strict';



  router.route('/')

  // GET ALL USERS
  .get(
    Celebrate({
      headers: Joi.object().keys({
        'authorization': Joi.string().required()
      }).options({ allowUnknown: true })
    }),
    (req,res,next) => {

    // Store user's API key
    let key = req.headers.authorization;
    if(!key || key != process.env.API_ADMIN_SECRET) {
      // If no key was provided, return Forbidden
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
  })

  // CREATE NEW USER
  .post(
    // Validate input, returning an error on fail
    Celebrate({
      body: Joi.object().keys({
        api_key: Joi.string().required()
      })
    }),
    // Input has been validated
    (req,res,next) => {
    console.log("Responding to POST /user");
    let api_key = req.body.api_key;

    // Request is good. Add an entry.
    store
      .addUser(api_key)
      .then((user_id) => {
        console.log(`Added user with api key: "${api_key}" and id: ${user_id}`);

        // Construct URI where the created resource will be available.
        let uri = '/user/' + user_id;

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Location', uri);
        res.status(201);
        res.send({id : user_id});
      });
  });


  router.route('/:key')

  // Get user by API key
  .get((req,res,next) => {
    let key = req.params.key;

    store
      .getUserByKey(key)
      .then((data) => {
        let user = data[0];

        if(!user) {
          console.log("No user found with api key " + key);
          res.sendStatus(404);
          return false;
        }

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send({
          id: user.id,
          api_key: user.api_key
        });
      })
  })


  router.use(Celebrate.errors());  
};
