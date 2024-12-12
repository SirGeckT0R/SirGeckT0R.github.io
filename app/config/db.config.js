module.exports = {
  HOST: process.env.DB_HOST || 'mouse.db.elephantsql.com',
  USER: process.env.DB_USER || 'dtiafvzm',
  PASSWORD: process.env.DB_PASSWORD || 'sN_m_1h4IPhcszfkY7Zd9QFo9PU4adRz',
  DB: process.env.DB_NAME || 'dtiafvzm',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
