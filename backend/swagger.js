const doc = {
  info: {
    title: 'Busreservierungssystem API',
    description: 'Documentation for Busreservierungssystem API'
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger-output.json';
const endpointsFiles = [
  './server.js',
  './services/user.js', // explizit mit aufnehmen
  './services/*.js'     // optional: alle services
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server.js'); // Your project's root file
});