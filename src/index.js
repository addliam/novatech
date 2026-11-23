'use strict';

const MIGRACIONES = require('./seed/migraciones');

const ACCIONES_PUBLICAS = ['api::product.product.find', 'api::product.product.findOne'];

async function darPermisosPublicos(strapi) {
  const rol = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!rol) return;

  for (const action of ACCIONES_PUBLICAS) {
    const existe = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: rol.id } });
    if (!existe) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: rol.id } });
    }
  }
}

// Aplica cada migración de datos una sola vez. La versión aplicada se guarda en el store de Strapi
// (tabla strapi_core_store_settings), así funciona igual en SQLite, en el Postgres de Docker y en RDS.
async function migrarDatos(strapi) {
  const store = strapi.store({ type: 'core', name: 'novatech' });
  const actual = (await store.get({ key: 'version_datos' })) || 0;
  const productos = strapi.documents('api::product.product');

  for (const m of MIGRACIONES.filter((x) => x.version > actual)) {
    let creados = 0;
    for (const data of m.productos) {
      // Evita duplicados si la base ya tenía el producto (p. ej. semilla anterior sin versión).
      const ya = await productos.findFirst({ filters: { nombre: data.nombre } });
      if (!ya) {
        await productos.create({ data });
        creados++;
      }
    }
    await store.set({ key: 'version_datos', value: m.version });
    strapi.log.info(`Migración de datos v${m.version} (${m.descripcion}): ${creados} productos creados`);
  }
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    await darPermisosPublicos(strapi);
    await migrarDatos(strapi);
  },
};
