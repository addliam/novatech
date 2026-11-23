'use strict';

module.exports = {
  index(ctx) {
    ctx.body = { servidor: process.env.SERVIDOR || 'local' };
  },
};
