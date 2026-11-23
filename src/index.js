'use strict';

const PRODUCTOS_SEMILLA = [
  { nombre: 'Mouse X1', descripcion: 'Mouse inalámbrico 2.4 GHz, 1600 DPI', precio: 59.9, imagen_url: '/img/mouse.svg' },
  { nombre: 'Teclado K2', descripcion: 'Teclado mecánico, switch rojo, retroiluminado', precio: 189, imagen_url: '/img/teclado.svg' },
  { nombre: 'Audífonos H3', descripcion: 'Audífonos Bluetooth 5.3 con micrófono', precio: 129, imagen_url: '/img/audifonos.svg' },
  { nombre: 'Hub USB-C', descripcion: 'Hub de 7 puertos con HDMI 4K', precio: 99, imagen_url: '/img/hub.svg' },
  { nombre: 'Webcam W1', descripcion: 'Cámara web Full HD 1080p', precio: 149, imagen_url: '/img/webcam.svg' },
];

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

async function cargarSemilla(strapi) {
  const productos = strapi.documents('api::product.product');
  if ((await productos.count()) > 0) return;

  for (const data of PRODUCTOS_SEMILLA) {
    await productos.create({ data });
  }
  strapi.log.info(`Semilla: ${PRODUCTOS_SEMILLA.length} productos creados`);
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    await darPermisosPublicos(strapi);
    await cargarSemilla(strapi);
  },
};
