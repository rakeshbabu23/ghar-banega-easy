const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.on('connected', () => {
    console.log('MongoDB connected successfully');
})

connection.on('error', (err) => {
    console.log('MongoDB connection error: ', err);
})

module.exports = mongoose;