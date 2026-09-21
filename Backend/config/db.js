const db = require('../src/config/db');

module.exports = db.connectDB;
module.exports.connectDB = db.connectDB;
module.exports.getStatus = db.getStatus;
