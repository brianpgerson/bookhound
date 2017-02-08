require('dotenv').config();


const config = require('../config/main');
config.database = `mongodb://localhost/${config.test_db}`;
process.env.NODE_ENV = config.test_env;

exports.URI = '127.0.0.1';
