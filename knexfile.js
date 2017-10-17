module.exports = {
  development: {
    client: 'mysql',
    connection: {
      user: 'vagrant',
      password: 'vagrant',
      database: 'realtimeforms'
    },
    debug: true
  },

  production: {
    client: 'mysql',
    connection: process.env.JAWSDB_MARIA_URL
    pool: {
      min: 2,
      max: 10
    }
  }
}