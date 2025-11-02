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
  './server.js', // only scan server.js which requires/mounts the routers
  //,'./services/user.js', './services/tour.js', './services/buses.js' hinzugefuegt
  './services/user.js',
  './services/tour.js',
  './services/buses.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  // Don't start the server automatically after generation to avoid
  // DB connection errors when running the generator in isolation.
  // To start the server after docs generation set environment variable START_SERVER_AFTER_DOCS=1
  if (process.env.START_SERVER_AFTER_DOCS === '1') {
    require('./server.js'); // start server only when explicitly requested
  } else {
    console.log('swagger-autogen: generation finished — server not started (set environment variable START_SERVER_AFTER_DOCS=1 to start)');
  }
});