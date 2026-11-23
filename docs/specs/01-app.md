# 01 · App: Strapi (back) + tienda (front)

**Responsable:** tú · **Depende de:** nada · **Lo necesitan:** 03

## Objetivo

Un repo en GitHub que, con `docker compose up --build` y un `.env` copiado de `.env.example`, levante Strapi + Postgres con el CMS, la API, la tienda y productos de ejemplo. Nadie debe instalar Node ni Postgres.

## Alcance

**Back (Strapi)**
1. Crear proyecto: `npx create-strapi@latest novatech --no-run` (Strapi 5, TypeScript no obligatorio).
2. En local la BD es el servicio `postgres` de `compose.yml` (PostgreSQL 16), igual motor que RDS. No usar SQLite.
3. Collection type `Product` con los campos del contrato (00). Draft & publish desactivado.
4. Permisos: rol **Public** → `Product: find, findOne`. Nada más público.
5. Endpoint `GET /api/servidor` → `{ "servidor": process.env.SERVIDOR }` (ruta y controlador custom, público).
6. `config/database.js` leyendo las variables del contrato, con SSL según `DATABASE_SSL`.
7. Semilla: al arrancar (`src/index.js` → `bootstrap`) crear 5 productos de ejemplo **solo si la tabla está vacía**. Así no hay que correr comandos extra ni en local ni en la EC2.
8. `.env.example` con los nombres del contrato. `.gitignore` con `.env`, `node_modules`, `.tmp`, `build`, `dist`.

**Docker**
1. `Dockerfile` multi-etapa sobre `node:20-alpine`: instala dependencias con `npm ci`, ejecuta `npm run build` con `NODE_ENV=production`, expone 1337, arranca con `npm start`.
2. `.dockerignore`: `node_modules`, `.env`, `.tmp`, `build`, `dist`, `.git`.
3. `compose.yml` (local): servicios `postgres` (postgres:16, volumen `db-data`, healthcheck `pg_isready`) y `strapi` (build `.`, `env_file: .env`, sobrescribe `DATABASE_HOST=postgres` y `DATABASE_SSL=false`, `depends_on` con condición healthy, puerto `1337:1337`).
4. `compose.prod.yml` (EC2): solo `strapi`, `build .`, `env_file: .env`, puerto `1337:1337`, `restart: always`.
5. El `.env` nunca se copia dentro de la imagen; se inyecta al correr.

**Front (`public/`)**
1. `public/index.html` + `public/app.js` + `public/styles.css`. Sin framework ni build.
2. Al cargar: `fetch('/api/products')` y pinta tarjetas con imagen, nombre, descripción y precio (`S/ 59.90`).
3. Pie de página: `Atendido por: <servidor>` con `fetch('/api/servidor')`.
4. Si la API falla: mensaje "No se pudieron cargar los productos".
5. Responsive básico (1 columna en móvil, grilla en escritorio). Logo y colores de NovaTech Store.

## Fuera de alcance

Carrito, pagos, login de clientes, subida de imágenes, búsqueda.

## Entregables

- Repo GitHub `novatech-store` (privado; dar acceso a los 3 colegas).
- `README.md` con: requisito único (Docker Desktop), levantar en local (`copy .env.example .env` → `docker compose up --build`), levantar en servidor (`docker compose -f compose.prod.yml up -d --build`), cómo crear el admin y cómo reiniciar desde cero (`docker compose down -v`).

## Criterios de aceptación (en local)

- [ ] `GET /api/products` devuelve los 5 productos de la semilla.
- [ ] `/` muestra las 5 tarjetas con imagen, nombre, descripción y precio.
- [ ] En `/admin` crear un producto → aparece en `/` al recargar.
- [ ] En `/admin` eliminar un producto → desaparece de `/` al recargar.
- [ ] `GET /api/servidor` devuelve el valor de `SERVIDOR`.
- [ ] `GET /_health` responde 204.
- [ ] En una PC que solo tiene Docker: clonar + `.env` + `docker compose up --build` → todo lo anterior funciona sin otro paso.
- [ ] `docker compose down` y `up` de nuevo → los productos siguen (volumen) y la semilla no se duplica.
- [ ] `compose.prod.yml` levanta apuntando a una BD externa (probar con el postgres local publicado en 5432).

## Entrega a 03

Mensaje con: URL del repo, rama `main`, commit probado, y confirmación de que el README fue probado desde cero.

## Evidencia

`evidencias/01/`: tipo de contenido en el admin, permisos Public, tienda en local, JSON de la API.
