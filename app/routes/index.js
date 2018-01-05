const changeCase = require('change-case');
const express = require('express');
const routes = require('require-dir')();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerConf = YAML.load('./doc/apiDoc.yml');

module.exports = function initializeApp(app) {
  const router = express.Router();

  // Initialize documentation route
  console.log(swaggerConf);
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConf));
  app.use(router);

  // Initialize all API routes
  Object.keys(routes).forEach((routeName) => {
    const router2 = express.Router();

    // Initialize the route to add its functionality to router
    require(`./${routeName}`)(router2);

    // Add router to the speficied route name in the app
    const routePrefix = '/api/';
    const route = routePrefix + changeCase.paramCase(routeName);
    app.use(route, router2);
    console.log(`info: [SERVER] Added route ${route}`);
  });
};
