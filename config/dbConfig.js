const mongoose = require('mongoose')
function dbConfig() {
    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Get the default connection
  const db = mongoose.connection;
  
  // Event handlers for connection events
  db.on('connected', () => {
    console.log(`Connected to MongoDB at ${process.env.MONGO_URL}`);
  });
  
  db.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });
  
  db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
  });
  
  // Gracefully close the Mongoose connection when the Node process is terminated
  process.on('SIGINT', () => {
    db.close(() => {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
}
module.exports = dbConfig;