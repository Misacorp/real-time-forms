const path = require('path');

module.exports = {
  swaggerDefinition: {
    info: {
      title: 'Real Time Forms',
      version: '0.0.2',
    },
    produces: ['application/json',
    ],
    consumes: ['application/json',
    ],
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../app/routes/response.js'),
    path.join(__dirname, '../app/routes/user.js'),
    path.join(__dirname, '../app/routes/question.js'),
  ],
};

