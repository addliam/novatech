'use strict';

const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client === 'sqlite') {
    return {
      connection: {
        client: 'sqlite',
        connection: { filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')) },
        useNullAsDefault: true,
      },
    };
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'novatech'),
        user: env('DATABASE_USERNAME', 'novatech'),
        password: env('DATABASE_PASSWORD', 'novatech'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
      },
      pool: { min: 0, max: 10 },
      acquireConnectionTimeout: 60000,
    },
  };
};
