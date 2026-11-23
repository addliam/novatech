'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/servidor',
      handler: 'servidor.index',
      config: { auth: false },
    },
  ],
};
