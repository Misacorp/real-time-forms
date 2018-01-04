const path = require('path');

module.exports = {
  swaggerDefinition: {
    info: {
      title: 'Real Time Forms',
      version: '0.0.3',
    },
    produces: ['application/json; charset=utf-8',
    ],
    consumes: ['application/json',
    ],
    securityDefinitions: {
      ApiKeyAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    security: [
      { ApiKeyAuth: [] },
    ],
    responses: {
      Forbidden: {
        description: 'API key not provided in Auhtorization header, or key is invalid.',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
    },
    definitions: {
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
        required: [
          'code',
          'message',
        ],
      },
    },
  },
  apis: [
    path.join(__dirname, '../app/routes/response.js'),
    path.join(__dirname, '../app/routes/user.js'),
    path.join(__dirname, '../app/routes/question.js'),
  ],
};

