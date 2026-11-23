# AGENTS.md — guía para agentes de código

Lee esto antes de tocar el proyecto. Si te pidieron "levanta este proyecto", sigue **Levantar en local** y luego **Verificar**.

## Qué es

NovaTech Store: tienda online de un trabajo universitario (UPC, Arquitectura de Computadoras y SO, TB2).
Un solo proceso **Strapi 5** (Node.js) sirve tres cosas:

| Ruta | Qué es |
|---|---|
| `/` | Tienda (HTML + JS + CSS sin framework, en `public/`) |
| `/admin` | Panel CMS de Strapi (crear/eliminar productos) |
| `/api/products` | API REST pública (solo lectura) |
| `/api/servidor` | `{ "servidor": $SERVIDOR }`, muestra qué instancia atendió |
| `/_health` | 204, health check del balanceador |

Base de datos: **PostgreSQL** (en local con Docker; en AWS, RDS). Strapi se conecta directo por TCP 5432; no hay API sobre Postgres.

Arquitectura en AWS: ALB → 2 EC2 (Ubuntu 24.04, Docker) en 2 zonas → 1 RDS PostgreSQL. Ver `docs/diagramas/c4-arquitectura.svg`.

## Levantar en local (camino recomendado)

Requisito único: Docker con Compose v2.

```bash
git clone https://github.com/addliam/novatech.git
cd novatech
cp .env.example .env            # Windows PowerShell: copy .env.example .env
docker compose up --build       # primera vez: ~5-10 min (instala deps y compila el panel)
```

Listo cuando el log muestre `Strapi started successfully`. Abrir http://localhost:1337/.

- Al primer arranque se crean 10 productos con fotos (ver **Migraciones de datos**). No hay que correr nada más.
- `/admin` pide crear el primer administrador la primera vez. Hazlo desde el navegador o con:
  `docker compose exec strapi npx strapi admin:create-user --email=<email> --password=<clave> --firstname=Admin`
  No inventes credenciales del usuario humano: pregúntale o crea una de prueba y guárdala solo en `.env`.
- Reiniciar desde cero (borra la BD local): `docker compose down -v`.

## Levantar sin Docker (solo desarrollo)

Requiere **Node ≥ 22** y **npm ≥ 11**. Con `DATABASE_CLIENT=sqlite` en `.env` no hace falta Postgres.

```bash
npm install
npm run develop      # http://localhost:1337
```

## Verificar (hazlo siempre después de levantar)

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:1337/_health      # 204
curl -s localhost:1337/api/products | head -c 300                   # JSON con "data": [ ... 10 productos ]
curl -s localhost:1337/api/servidor                                 # {"servidor":"local"}
curl -s -o /dev/null -w "%{http_code}\n" localhost:1337/            # 200 (HTML de la tienda, no redirect)
curl -s -o /dev/null -w "%{http_code}\n" localhost:1337/img/fotos/mouse.jpg   # 200
```

En el navegador: la tienda muestra banner + 10 tarjetas con foto; "Agregar al carrito" suma al contador del encabezado; el ícono del carrito abre el panel con cantidades, subtotales, total y botón "Pagar" (no hace nada a propósito).

## Desplegar en AWS (EC2)

Pasos completos en `docs/specs/02-ops-red-bd.md`, `03-ops-computo.md` y `04-ops-alb-pruebas.md`. Resumen en la EC2:

```bash
cp .env.example .env && nano .env
#   DATABASE_HOST=<endpoint RDS>  DATABASE_SSL=true  SERVIDOR=EC2 A (o EC2 B)
#   APP_KEYS, *_SECRET, *_SALT: claves NUEVAS y las MISMAS en EC2 A y B
docker compose -f compose.prod.yml up -d --build
```

`compose.prod.yml` solo levanta Strapi (`restart: always`); la BD es RDS. Usa instancia de **≥ 2 GB RAM** (t3.small): con 1 GB la construcción del panel falla.

## Mapa del código

```
config/database.js        Postgres por defecto; sqlite si DATABASE_CLIENT=sqlite
config/middlewares.js     CSP con img-src https: ; registra global::tienda
src/middlewares/tienda.js sirve public/index.html en "/" (Strapi redirige "/" a /admin por defecto)
src/api/product/          tipo Product: nombre, descripcion, precio, imagen_url (draft&publish OFF)
src/api/servidor/         GET /api/servidor
src/index.js              bootstrap: permisos públicos find/findOne + migraciones de datos
src/seed/migraciones.js   datos de ejemplo versionados (v1, v2, v3)
public/                   tienda: index.html, app.js (catálogo + carrito), styles.css
public/img/fotos/         10 fotos Unsplash + CREDITOS.md
Dockerfile                multi-etapa node:22-alpine, instala npm 11 antes de npm ci
compose.yml               local: strapi + postgres:16 (volumen db-data)
compose.prod.yml          EC2: solo strapi apuntando a RDS
docs/                     specs, diagramas e informe (excluido de la imagen Docker)
```

## Migraciones de datos

`src/seed/migraciones.js` es una lista versionada. En cada arranque, `src/index.js` aplica solo las versiones mayores a la guardada en el store de Strapi (`core` / `novatech` / `version_datos`).

- Para agregar datos: añade `{ version: N+1, productos: [...] }` o `{ version: N+1, actualizar: [{ nombre, cambios }] }` **al final**.
- **Nunca edites ni borres versiones ya publicadas**: las bases existentes no las volverían a aplicar.
- Un producto borrado desde el panel no reaparece al reiniciar (por diseño).

## Reglas y trampas conocidas

- **No subas `.env`** ni lo copies a la imagen (ya está en `.gitignore` y `.dockerignore`).
- **Node 22+ obligatorio** (Strapi 5.63). La imagen usa `node:22-alpine`.
- **npm 11**: el `package-lock.json` se generó con npm 11; con npm 10, `npm ci` falla con "Missing: date-fns". Por eso el Dockerfile instala npm 11. Si cambias dependencias, regenera el lock con npm 11.
- **Imágenes**: usa rutas locales (`/img/...`) o URLs `https://`. Las `http://` las bloquea la CSP. No subas imágenes por el panel de Strapi en producción: quedarían en el disco de una sola EC2.
- **Fin de línea LF** (`.gitattributes`). No conviertas a CRLF: rompe scripts dentro del contenedor.
- **Puerto 1337 ocupado**: suele ser un Strapi anterior; detenlo antes de levantar otro.
- El carrito vive solo en el navegador (`localStorage`); no hay pagos ni pedidos en el backend. No lo "arregles" sin que te lo pidan.
- `strapi develop` no siempre recarga al editar `src/index.js` o `src/seed/`: reinicia el proceso.

## Si te piden cambios

- Front: solo `public/` (sin build). Recarga con Ctrl+F5.
- Nuevos campos del producto: edita `schema.json`, actualiza `public/app.js` y agrega una migración si hay datos de ejemplo.
- Contrato compartido con el equipo (campos, endpoints, variables `.env`): `docs/specs/00-contrato.md`. Si lo cambias, avisa al humano.
