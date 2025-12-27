const mongoose = require('mongoose');
const { Pool } = require('pg');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Running without MongoDB - some features will be limited');
  }
};

const createPostgresPool = () => {
  const config = process.env.POSTGRES_CONNECTION_STRING ? {
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  } : {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'ciphersqlstudio_sandbox',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_HOST && process.env.POSTGRES_HOST.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  };

  const pool = new Pool({
    ...config,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL client connected');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL client error:', err);
  });

  return pool;
};

const postgresPool = createPostgresPool();

const testPostgresConnection = async () => {
  try {
    const client = await postgresPool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection successful:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.log('⚠️ Running without PostgreSQL - query execution will be limited');
  }
};

testPostgresConnection();

module.exports = {
  connectDB,
  postgresPool
};