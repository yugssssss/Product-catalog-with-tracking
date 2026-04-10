const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://rathoreyug87_db_user:EYAgA0IflczCKgDK@db.ke6madt.mongodb.net/product-catalog?appName=Db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
