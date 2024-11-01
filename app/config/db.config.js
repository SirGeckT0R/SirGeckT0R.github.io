module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: process.env.DB_PORT || '5433',
  USER: process.env.DB_USER || 'test_admin',
  PASSWORD: process.env.DB_PASSWORD || 'test_1234',
  DB: process.env.DB_NAME || 'test_lab4_1',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
