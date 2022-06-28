const connections = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'rootroot',
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
