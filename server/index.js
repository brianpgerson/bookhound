'use strict'

// require('dotenv').config();

const express = require('express'),
          app = express(),
   bodyParser = require('body-parser'),
       logger = require('morgan'),
      winston = require('./config/logger'),
       router = require('./router'),
     mongoose = require('mongoose'),
 scheduleJobs = require('./scheduled/jobs'),
       config = require('./config/main');

// Database Setup
mongoose.Promise = require('bluebird'),
mongoose.connect(config.database);

// Start the server
let server;
switch (process.env.ENV) {
  case config.test_env: 
    server = app.listen(config.test_port);
    winston.log(`Your server is running on port ${config.port} in TEST MODE.`);
    break;
  case config.prod_env:
    server = app.listen(config.prod_port);
    winston.log(`Your server is running on port ${config.port} in PROD MODE.`);
    break;
  default: 
    server = app.listen(config.port);
    winston.log(`Your server is running on port ${config.port} in DEVELOPMENT MODE.`);
} 

// Set static file location for production
// app.use(express.static(__dirname + '/public'));

// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan

// Enable CORS from client-side
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Import routes to be served
router(app);

// Start scheduled jobs
if (process.env.NODE_ENV != config.test_env) {
    scheduleJobs.init();
}

// necessary for testing
module.exports = server;
