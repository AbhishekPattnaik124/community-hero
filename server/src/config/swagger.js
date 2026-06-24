const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Hero API',
      version: '1.0.0',
      description: 'Hyperlocal Problem Solver – REST API Documentation',
      contact: {
        name: 'Community Hero Team',
        email: 'api@communityhero.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Issue: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: {
              type: 'string',
              enum: ['roads', 'water', 'electricity', 'sanitation', 'parks', 'safety', 'noise', 'other'],
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
            },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
                address: { type: 'string' },
              },
            },
            images: { type: 'array', items: { type: 'string' } },
            upvotes: { type: 'array', items: { type: 'string' } },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            reporter: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['citizen', 'authority', 'admin'] },
            avatar: { type: 'string' },
            points: { type: 'number' },
            badges: { type: 'array', items: { type: 'string' } },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Issues', description: 'Community issue management' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Upload', description: 'File upload endpoints' },
      { name: 'Notifications', description: 'Notification management' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
