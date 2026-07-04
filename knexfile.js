module.exports = {
  client: 'better-sqlite3',
  connection: {
    filename: './tasks.db'
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/migrations',
    extension: 'js'
  },
  seeds: {
    directory: './src/seeds'
  }
};
