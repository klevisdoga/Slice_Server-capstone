const connections = {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: process.env.SERVER_USERNAME,
      password: process.env.SERVER_PASSWORD,
      database: 'Slice_DB',
      charset: 'utf8'
    },
  },
  production: {
    client: 'mysql',
    connection: process.env.JAWSDB_URL
  }
};

module.exports = 
process.env.NODE_ENV === 'production'
? connections.production
: connections.development
