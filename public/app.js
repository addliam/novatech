'use strict';

const ICONO_CARRITO = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6"/></svg>';

const formatoPrecio = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const soles = (centimos) => formatoPrecio.format(centimos / 100);
const aCentimos = (precio) => Math.round(Number(precio) * 100);

/* ---------- Carrito (solo en el navegador) ---------- */

const CLAVE_CARRITO = 'novatech-carrito';
// id -> { id, nombre, imagen_url, precioCent, cantidad }
const carrito = new Map();

function guardarCarrito() {
  try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify([...carrito.values()])); } catch { /* sin almacenamiento */ }
}

function leerCarrito() {
  try {
    const items = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
    for (const it of items) if (it && it.id && it.cantidad > 0) carrito.set(it.id, it);
  } catch { /* sin almacenamiento */ }
}

function agregarAlCarrito(producto) {
  const id = producto.documentId;
  const item = carrito.get(id);
  if (item) item.cantidad += 1;
  else carrito.set(id, { id, nombre: producto.nombre, imagen_url: producto.imagen_url, precioCent: aCentimos(producto.precio), cantidad: 1 });
  actualizarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.get(id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito.delete(id);
  actualizarCarrito();
}

function quitarDelCarrito(id) {
  carrito.delete(id);
  actualizarCarrito();
}

function crearFilaCarrito(item) {
  const li = document.createElement('li');
  li.className = 'item-carrito';

  const img = document.createElement('img');
  img.src = item.imagen_url;
  img.alt = '';

  const info = document.createElement('div');
  info.className = 'item-carrito__info';
  const nombre = document.createElement('p');
  nombre.className = 'item-carrito__nombre';
  nombre.textContent = item.nombre;
  const unit = document.createElement('p');
  unit.className = 'item-carrito__unitario';
  unit.textContent = `${soles(item.precioCent)} c/u`;

  const controles = document.createElement('div');
  controles.className = 'cantidad';
  const menos = Object.assign(document.createElement('button'), { type: 'button', textContent: '−' });
  menos.setAttribute('aria-label', `Quitar una unidad de ${item.nombre}`);
  menos.onclick = () => cambiarCantidad(item.id, -1);
  const cant = Object.assign(document.createElement('span'), { textContent: item.cantidad });
  cant.setAttribute('aria-label', 'Cantidad');
  const mas = Object.assign(document.createElement('button'), { type: 'button', textContent: '+' });
  mas.setAttribute('aria-label', `Agregar una unidad de ${item.nombre}`);
  mas.onclick = () => cambiarCantidad(item.id, 1);
  controles.append(menos, cant, mas);
  info.append(nombre, unit, controles);

  const lado = document.createElement('div');
  lado.className = 'item-carrito__lado';
  const subtotal = document.createElement('strong');
  subtotal.className = 'item-carrito__subtotal';
  subtotal.textContent = soles(item.precioCent * item.cantidad);
  const quitar = Object.assign(document.createElement('button'), { type: 'button', className: 'item-carrito__quitar', textContent: 'Quitar' });
  quitar.onclick = () => quitarDelCarrito(item.id);
  lado.append(subtotal, quitar);

  li.append(img, info, lado);
  return li;
}

function actualizarCarrito() {
  const items = [...carrito.values()];
  const unidades = items.reduce((s, it) => s + it.cantidad, 0);
  const totalCent = items.reduce((s, it) => s + it.precioCent * it.cantidad, 0);

  document.getElementById('contador-carrito').textContent = unidades;
  document.getElementById('carrito-lista').replaceChildren(...items.map(crearFilaCarrito));
  document.getElementById('carrito-vacio').hidden = items.length > 0;
  document.getElementById('carrito-total').textContent = soles(totalCent);
  const pagar = document.getElementById('btn-pagar');
  pagar.textContent = `Pagar ${soles(totalCent)}`;
  pagar.disabled = items.length === 0;

  guardarCarrito();
}

function abrirCarrito(abrir) {
  const panel = document.getElementById('carrito');
  panel.classList.toggle('abierto', abrir);
  panel.setAttribute('aria-hidden', String(!abrir));
  document.getElementById('carrito-fondo').hidden = !abrir;
  document.getElementById('abrir-carrito').setAttribute('aria-expanded', String(abrir));
  if (abrir) document.getElementById('cerrar-carrito').focus();
}

function iniciarCarrito() {
  leerCarrito();
  actualizarCarrito();
  document.getElementById('abrir-carrito').onclick = () => abrirCarrito(true);
  document.getElementById('cerrar-carrito').onclick = () => abrirCarrito(false);
  document.getElementById('carrito-fondo').onclick = () => abrirCarrito(false);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirCarrito(false); });
  // Pagar: sin funcionalidad por ahora.
  document.getElementById('btn-pagar').onclick = () => {};
}

/* ---------- Catálogo ---------- */

function crearTarjeta(producto) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  const img = document.createElement('img');
  img.src = producto.imagen_url;
  img.alt = producto.nombre;
  img.loading = 'lazy';
  img.onerror = () => { img.replaceWith(Object.assign(document.createElement('div'), { className: 'sin-imagen', textContent: 'Sin imagen' })); };

  const nombre = document.createElement('h2');
  nombre.textContent = producto.nombre;

  const descripcion = document.createElement('p');
  descripcion.className = 'descripcion';
  descripcion.textContent = producto.descripcion;

  const precio = document.createElement('p');
  precio.className = 'precio';
  precio.textContent = soles(aCentimos(producto.precio));

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn-carrito';
  boton.setAttribute('aria-label', `Agregar ${producto.nombre} al carrito`);
  boton.innerHTML = ICONO_CARRITO + '<span>Agregar al carrito</span>';
  boton.onclick = () => {
    agregarAlCarrito(producto);
    boton.classList.add('agregado');
    boton.querySelector('span').textContent = '¡Agregado!';
    setTimeout(() => { boton.classList.remove('agregado'); boton.querySelector('span').textContent = 'Agregar al carrito'; }, 900);
  };

  tarjeta.append(img, nombre, descripcion, precio, boton);
  return tarjeta;
}

async function cargarProductos() {
  const cargando = document.getElementById('cargando');
  try {
    const res = await fetch('/api/products?sort=createdAt:desc&pagination[pageSize]=100');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    document.getElementById('grilla').replaceChildren(...data.map(crearTarjeta));
    document.getElementById('vacio').hidden = data.length > 0;
  } catch (e) {
    console.error(e);
    document.getElementById('error').hidden = false;
  } finally {
    cargando.hidden = true;
  }
}

async function cargarServidor() {
  const destino = document.getElementById('servidor');
  try {
    const res = await fetch('/api/servidor', { cache: 'no-store' });
    const { servidor } = await res.json();
    destino.textContent = servidor;
  } catch {
    destino.textContent = 'desconocido';
  }
}

iniciarCarrito();
cargarProductos();
cargarServidor();
