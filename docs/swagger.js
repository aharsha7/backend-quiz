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
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Show it's JWT
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Scan all route files
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
