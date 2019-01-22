'use strict'

if ((process.env.ENV !== 'prod')) {
  require('dotenv').config();
}

const express = require('express'),
          app = express(),
   bodyParser = require('body-parser'),
         cors = require('cors'),
       logger = require('morgan'),
         path = require('path'),
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
    server = app.listen(config.port);
    app.use(express.static(path.resolve(__dirname, '../client/dist/')));
    winston.log(`Your server is running on port ${config.port} in PROD MODE.`);
    break;
  default: 
    server = app.listen(config.port);
    winston.log(`Your server is running on port ${config.port} in DEVELOPMENT MODE.`);
} 

const whitelist = ['https://www.bookhound.co', 'http://localhost:8080', 'localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors());


// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan

// Import routes to be served
router(app);

// Start scheduled jobs
if (!process.env.NODE_ENV || process.env.NODE_ENV !== config.test_env) {
  scheduleJobs.init();
}

// necessary for testing
module.exports = server;
