const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quiz App API",
      version: "1.0.0",
      description: "Backend API documentation for the Quiz Application",
    },
    servers: [
      {
        url: "https://backend-quiz-1-rx4t.onrender.com", 
        description: "Production server",
      },
      {
        url: "http://localhost:5000",
        description: "Local development server",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
