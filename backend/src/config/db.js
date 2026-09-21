const mongoose = require('mongoose');
const dns = require('dns');

require('dotenv').config();

// Use reliable DNS servers for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connect = () => {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripflow';

  if (/<|>/.test(mongoUri)) {
    throw new Error(
      'Invalid MongoDB URI: remove placeholder angle brackets and use a real connection string or the local default mongodb://127.0.0.1:27017/tripflow.'
    );
  }

  return mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = connect;