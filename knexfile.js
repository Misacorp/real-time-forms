module.exports = {
  development: {
    client: 'mysql',
    connection: {
      port: 6306,
      host: '127.0.0.1',
      user: 'vagrant',
      password: 'vagrant',
      database: 'realtimeforms',
    },
    debug: true,
  },

  production: {
    client: 'mysql',
    connection: process.env.JAWSDB_MARIA_URL,
    pool: {
      min: 2,
      max: 10,
    },
  },
};
