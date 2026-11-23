'use strict';

const fs = require('fs');
const path = require('path');

// Strapi redirige "/" a /admin por defecto. Este middleware sirve la tienda (public/index.html) en "/".
module.exports = (_config, { strapi }) => {
  const indexPath = path.join(strapi.dirs.static.public, 'index.html');

  return async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.path === '/') {
      ctx.type = 'html';
      ctx.body = fs.createReadStream(indexPath);
      return;
    }
    await next();
  };
};
