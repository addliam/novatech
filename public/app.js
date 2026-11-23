'use strict';

const formatoPrecio = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

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
  precio.textContent = formatoPrecio.format(Number(producto.precio));

  tarjeta.append(img, nombre, descripcion, precio);
  return tarjeta;
}

async function cargarProductos() {
  const cargando = document.getElementById('cargando');
  try {
    const res = await fetch('/api/products?sort=createdAt:desc&pagination[pageSize]=100');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    const grilla = document.getElementById('grilla');
    grilla.replaceChildren(...data.map(crearTarjeta));
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

cargarProductos();
cargarServidor();
