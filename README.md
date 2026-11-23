# NovaTech Store

Tienda online tolerante a fallos (TB2 · Arquitectura de Computadoras y SO · UPC).
Strapi 5 sirve en un solo proceso la **tienda** (`/`), el **panel CMS** (`/admin`) y la **API** (`/api/products`).
La base de datos es PostgreSQL (local con Docker; en AWS, RDS).

## Requisito

Solo **Docker Desktop** (Windows/Mac) o Docker Engine + Compose v2 (Linux).

## Levantar en local

```powershell
copy .env.example .env
docker compose up --build
```

| URL | Qué es |
|---|---|
| http://localhost:1337/ | Tienda |
| http://localhost:1337/admin | Panel CMS (la primera vez pide crear el usuario admin) |
| http://localhost:1337/api/products | API JSON |
| http://localhost:1337/api/servidor | Instancia que atendió |
| http://localhost:1337/_health | Health check (204) |

Al primer arranque se crean 5 productos de ejemplo y se dan permisos públicos de lectura. Los datos persisten en el volumen `db-data`.

Reiniciar desde cero (borra la BD local): `docker compose down -v`

## Levantar en servidor (EC2)

```bash
git clone <repo> novatech && cd novatech
cp .env.example .env && nano .env   # endpoint RDS, DATABASE_SSL=true, claves, SERVIDOR=EC2 A
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml logs -f
```

`restart: always` vuelve a levantar el contenedor si cae o si la EC2 se reinicia.

## Sin Docker (solo desarrollo)

Requiere Node 22+. Con `DATABASE_CLIENT=sqlite` en `.env` no necesita Postgres:

```powershell
npm install
npm run develop
```

## Estructura

```
config/database.js      conexión Postgres (o SQLite en desarrollo)
config/middlewares.js   CSP que permite imágenes https externas
src/api/product/        tipo Product (nombre, descripcion, precio, imagen_url)
src/api/servidor/       GET /api/servidor -> { servidor: $SERVIDOR }
src/index.js            permisos públicos + semilla de productos
public/                 tienda (HTML + JS + CSS, sin build)
Dockerfile              imagen de Strapi (la misma en local y AWS)
compose.yml             local: strapi + postgres
compose.prod.yml        EC2: solo strapi, apunta a RDS
```

> ¿Usas un agente de código (Claude Code, Codex, Cursor…)? Pídele que lea [AGENTS.md](AGENTS.md).
