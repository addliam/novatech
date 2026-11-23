# 00 · Contrato común (leer antes que todo)

Fuente de verdad compartida. Si algo de aquí cambia, se avisa a todos.

## Roles

| Spec | Rol | Responsable | Entrega |
|---|---|---|---|
| 01 | App (front + back) | Tú | Repo Strapi con tienda, en GitHub |
| 02 | Ops · Red y BD | Colega 1 | VPC, security groups, RDS PostgreSQL |
| 03 | Ops · Cómputo | Colega 2 | EC2 A con la app corriendo, AMI, EC2 B |
| 04 | Ops · Balanceo y pruebas | Colega 3 | Target group, ALB, pruebas E2E con evidencia |

Orden de integración: **01 + 02 en paralelo → 03 → 04**. Cada spec lista qué puede adelantar sin esperar.

## Arquitectura (ver `diagramas/c4-arquitectura.svg`)

Navegador → ALB :80 → EC2 A / EC2 B (Ubuntu 24.04, Docker, contenedor Strapi :1337) → RDS PostgreSQL :5432.

## Contenedores (Docker)

| Archivo | Dónde se usa | Servicios |
|---|---|---|
| `Dockerfile` | local y AWS | Imagen de Strapi (la misma en ambos lados) |
| `compose.yml` | local | `strapi` + `postgres` (postgres:16 con volumen) |
| `compose.prod.yml` | EC2 A y B | solo `strapi`, `restart: always`, apunta a RDS |

Levantar en local: `docker compose up --build` → `http://localhost:1337`.
Levantar en EC2: `docker compose -f compose.prod.yml up -d --build`.
No se usa PM2: la política `restart: always` reinicia el contenedor si cae o si la EC2 se reinicia.
No hay API sobre Postgres: Strapi se conecta directo con el driver `pg`.

## Modelo de datos: `Product` (Strapi collection type)

| Campo | Tipo Strapi | Obligatorio | Ejemplo |
|---|---|---|---|
| nombre | Short text | sí | Mouse inalámbrico X1 |
| descripcion | Long text | sí | Mouse 2.4 GHz, 1600 DPI |
| precio | Decimal | sí | 59.90 |
| imagen_url | Short text (URL) | sí | https://i.imgur.com/abc.jpg |

Draft & publish: **desactivado** (lo que se crea en el admin se ve de inmediato).

## Endpoints

| Método y ruta | Acceso | Respuesta |
|---|---|---|
| `GET /` | público | Tienda (`public/index.html`) |
| `GET /api/products` | público | `{ "data": [ { "id", "documentId", "nombre", "descripcion", "precio", "imagen_url", ... } ], "meta": {...} }` |
| `GET /api/servidor` | público | `{ "servidor": "EC2 A" }` (valor de la variable `SERVIDOR`) |
| `GET /_health` | público | `204` sin cuerpo (lo trae Strapi; lo usa el ALB) |
| `/admin` | login admin | Panel CMS: crear y eliminar productos |

## Variables `.env` (nombres exactos)

```
HOST=0.0.0.0
PORT=1337
APP_KEYS=<4 claves separadas por coma>
API_TOKEN_SALT=<clave>
ADMIN_JWT_SECRET=<clave>
TRANSFER_TOKEN_SALT=<clave>
JWT_SECRET=<clave>
ENCRYPTION_KEY=<clave>
DATABASE_CLIENT=postgres
DATABASE_HOST=<endpoint RDS>
DATABASE_PORT=5432
DATABASE_NAME=novatech
DATABASE_USERNAME=<usuario>
DATABASE_PASSWORD=<clave>
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
SERVIDOR=EC2 A
```

Reglas:
- El `.env` **nunca** va a GitHub. El repo trae `.env.example` con estos nombres y valores vacíos.
- Las claves (APP_KEYS, JWT, etc.) son **las mismas** en EC2 A y B (por eso B se clona por AMI). Solo cambia `SERVIDOR`.
- Credenciales se comparten por canal privado, no en el grupo general ni en el informe.

## Versiones

Node.js 22 LTS (imagen `node:22-alpine`; Strapi 5.63 exige Node ≥ 22) · Strapi 5 · PostgreSQL 16 · Docker Engine + Compose v2 · Ubuntu Server 24.04 LTS · región `us-east-1`.

En local con Docker, `DATABASE_HOST=postgres` y `DATABASE_SSL=false` (lo fija `compose.yml`); en AWS, el endpoint de RDS y `DATABASE_SSL=true`.

## Nombres de recursos AWS

`novatech-vpc`, `novatech-sg-alb`, `novatech-sg-web`, `novatech-sg-db`, `novatech-db`, `novatech-ec2-a`, `novatech-ec2-b`, `novatech-ami-v1`, `novatech-tg`, `novatech-alb`.

## Evidencia para el informe

Cada responsable guarda capturas en `evidencias/<spec>/` numeradas en orden (`01-...png`) y anota en 3–5 líneas qué hizo y por qué. Eso alimenta los capítulos 2–4.

## Nota de evaluación

La nota es individual y en la exposición preguntan por todo. Cada uno debe leer las 4 specs y poder explicar el diagrama completo.
