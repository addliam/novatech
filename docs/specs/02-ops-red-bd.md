# 02 · Ops: red y base de datos

**Responsable:** colega 1 · **Depende de:** nada (empieza el día 1) · **Lo necesitan:** 03 y 04

## Objetivo

Dejar lista la red y una RDS PostgreSQL externa, accesible solo desde las EC2.

## Alcance

1. **Cuenta y región:** confirmar con el profe AWS Academy o cuenta propia. Región `us-east-1`.
2. **VPC:** usar la VPC por defecto (o crear `novatech-vpc`) con al menos **2 subredes públicas en 2 zonas** (`us-east-1a`, `us-east-1b`) y 2 subredes para la BD.
3. **Security groups** (nombres del contrato):

| SG | Entrada | Desde |
|---|---|---|
| `novatech-sg-alb` | 80/TCP | 0.0.0.0/0 |
| `novatech-sg-web` | 1337/TCP | `novatech-sg-alb` |
| `novatech-sg-web` | 22/TCP | Tu IP (/32) |
| `novatech-sg-db` | 5432/TCP | `novatech-sg-web` |

4. **RDS:** `novatech-db`, PostgreSQL 16, plantilla Free tier / dev, `db.t3.micro` (o `db.t4g.micro`), 20 GB gp3, Single-AZ, acceso público **No**, SG `novatech-sg-db`, base inicial `novatech`, backups automáticos 1 día.
5. Probar la conexión desde una EC2 temporal o desde la EC2 A cuando exista: `psql -h <endpoint> -U <usuario> -d novatech`.

## Entregables

- Endpoint RDS, puerto, nombre de BD, usuario y clave → a 03 por canal privado.
- IDs de las subredes (a y b) y de los 3 SG → a 03 y 04.
- Tabla de costos mensuales de RDS (AWS Pricing Calculator) para el Cap. 2.

## Criterios de aceptación

- [ ] RDS en estado *Available*, no pública.
- [ ] Desde la EC2 la conexión `psql` funciona; desde tu PC (Internet) **no** conecta.
- [ ] Los 3 SG existen con exactamente las reglas de la tabla.

## Evidencia

`evidencias/02/`: subredes, cada SG con sus reglas, configuración RDS, conexión `psql` exitosa.

## Para la sustentación

Saber explicar: por qué la BD está fuera de las EC2, por qué no es pública, qué es un security group, Multi-AZ como mejora (y su costo).
