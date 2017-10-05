const changeCase = require('change-case');
const express = require('express');
const routes = require('require-dir')();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

module.exports = function(app) {
  'use strict';

  let router = express.Router();

  // Initialize documentation route
  const spec = swaggerJSDoc({
    swaggerDefinition: {
      info: {
        title: 'Real Time Forms',
        version: '0.0.01'
      },
      produces: ['application/json'],
      consumes: ['application/json'],
      securityDefinitions: {
        jwt: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      },
      security: [
        { jwt: [] }
      ]
    },
    apis: [
      'app/routes/*.js'
    ]
  });

  router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  console.log(swaggerUi.serve);
  app.use(router);

  // Initialize all API routes
  Object.keys(routes).forEach(function(routeName) {
    let router = express.Router();
    // You can add some middleware here 
    // router.use(someMiddleware);

    // Initialize the route to add its functionality to router
    require('./' + routeName)(router);
    
    // Add router to the speficied route name in the app
    let route_prefix = '/api/';
    let route = route_prefix + changeCase.paramCase(routeName);
    app.use(route, router);
    console.log(`info: [SERVER] Added route ${route}`);
  }); 
};