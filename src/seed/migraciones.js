'use strict';

// Datos de ejemplo versionados. Cada migración se aplica una sola vez por base de datos
// (la versión aplicada queda guardada en el store de Strapi). Para agregar más datos,
// añade una nueva entrada al final con version = la siguiente; nunca edites las anteriores.

module.exports = [
  {
    version: 1,
    descripcion: 'Catálogo inicial (5 productos)',
    productos: [
      { nombre: 'Mouse X1', descripcion: 'Mouse inalámbrico 2.4 GHz, 1600 DPI', precio: 59.9, imagen_url: '/img/mouse.svg' },
      { nombre: 'Teclado K2', descripcion: 'Teclado mecánico, switch rojo, retroiluminado', precio: 189, imagen_url: '/img/teclado.svg' },
      { nombre: 'Audífonos H3', descripcion: 'Audífonos Bluetooth 5.3 con micrófono', precio: 129, imagen_url: '/img/audifonos.svg' },
      { nombre: 'Hub USB-C', descripcion: 'Hub de 7 puertos con HDMI 4K', precio: 99, imagen_url: '/img/hub.svg' },
      { nombre: 'Webcam W1', descripcion: 'Cámara web Full HD 1080p', precio: 149, imagen_url: '/img/webcam.svg' },
    ],
  },
  {
    version: 2,
    descripcion: 'Ampliación del catálogo (5 productos)',
    productos: [
      { nombre: 'Monitor M24', descripcion: 'Monitor 24" Full HD IPS, 75 Hz', precio: 549, imagen_url: '/img/monitor.svg' },
      { nombre: 'Parlante P5', descripcion: 'Parlante Bluetooth portátil, 10 W', precio: 119, imagen_url: '/img/parlante.svg' },
      { nombre: 'USB 128 GB', descripcion: 'Memoria USB 3.2 de 128 GB', precio: 45, imagen_url: '/img/memoria.svg' },
      { nombre: 'Cargador 65W', descripcion: 'Cargador USB-C GaN de 65 W', precio: 89, imagen_url: '/img/cargador.svg' },
      { nombre: 'Mousepad XL', descripcion: 'Mousepad extendido 80 x 30 cm', precio: 39.9, imagen_url: '/img/mousepad.svg' },
    ],
  },
  {
    version: 3,
    descripcion: 'Fotos reales (Unsplash) para los 10 productos',
    actualizar: [
      { nombre: 'Mouse X1', cambios: { imagen_url: '/img/fotos/mouse.jpg' } },
      { nombre: 'Teclado K2', cambios: { imagen_url: '/img/fotos/teclado.jpg' } },
      { nombre: 'Audífonos H3', cambios: { imagen_url: '/img/fotos/audifonos.jpg' } },
      { nombre: 'Hub USB-C', cambios: { imagen_url: '/img/fotos/hub.jpg' } },
      { nombre: 'Webcam W1', cambios: { imagen_url: '/img/fotos/webcam.jpg' } },
      { nombre: 'Monitor M24', cambios: { imagen_url: '/img/fotos/monitor.jpg' } },
      { nombre: 'Parlante P5', cambios: { imagen_url: '/img/fotos/parlante.jpg' } },
      { nombre: 'USB 128 GB', cambios: { imagen_url: '/img/fotos/memoria.jpg' } },
      { nombre: 'Cargador 65W', cambios: { imagen_url: '/img/fotos/cargador.jpg' } },
      { nombre: 'Mousepad XL', cambios: { imagen_url: '/img/fotos/mousepad.jpg' } },
    ],
  },
];
