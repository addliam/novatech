# 03 · Ops: cómputo (EC2 A, AMI, EC2 B)

**Responsable:** colega 2 · **Depende de:** 01 (repo) y 02 (RDS y SG) · **Lo necesita:** 04

## Puede adelantar sin esperar

- Lanzar EC2 A e instalar Docker y Git (pasos 1–2).
- Redactar la justificación técnica y económica del Cap. 2 (CPU, RAM, disco, SO).

## Alcance

1. **Lanzar `novatech-ec2-a`:** Ubuntu Server 24.04 LTS, `t3.small` (2 vCPU, 2 GB), 20 GB gp3, subred zona `us-east-1a`, IP pública sí, SG `novatech-sg-web`, par de claves propio.
2. **Preparar el SO:**
   ```
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com | sudo sh     # Docker Engine + Compose v2
   sudo usermod -aG docker ubuntu && newgrp docker
   sudo systemctl enable docker                    # Docker arranca con la EC2
   sudo apt install -y git postgresql-client
   ```
3. **Desplegar la app** (repo de 01):
   ```
   git clone <repo> /home/ubuntu/novatech && cd /home/ubuntu/novatech
   cp .env.example .env && nano .env      # valores de 02 + claves nuevas + SERVIDOR=EC2 A
   docker compose -f compose.prod.yml up -d --build
   docker compose -f compose.prod.yml logs -f    # esperar "Strapi started"
   ```
4. Crear el usuario admin entrando a `http://<ip-ec2-a>:1337/admin` (abrir temporalmente 1337 a tu IP en el SG). La semilla corre sola al primer arranque.
5. **AMI:** `novatech-ami-v1` desde EC2 A (con el contenedor ya funcionando; la imagen Docker queda incluida en el disco).
6. **Lanzar `novatech-ec2-b`** desde la AMI, misma config pero subred `us-east-1b`. Entrar por SSH, cambiar en `.env` `SERVIDOR=EC2 B` y `docker compose -f compose.prod.yml up -d` (recrea el contenedor con el nuevo valor).

## Entregables

- IDs de EC2 A y B → a 04.
- Tabla comparativa de tipos de instancia (t2.micro / t3.small / t3.medium) con precio por hora y mes, y SO Ubuntu vs Windows Server, para el Cap. 2.

## Criterios de aceptación

- [ ] `curl localhost:1337/_health` → 204 en ambas.
- [ ] `curl localhost:1337/api/servidor` → `EC2 A` en una y `EC2 B` en la otra.
- [ ] Tras `sudo reboot`, el contenedor vuelve solo (`restart: always`); verificar con `docker ps`.
- [ ] Un producto creado vía EC2 A se ve vía EC2 B (misma RDS).

## Evidencia

`evidencias/03/`: lanzamiento de instancia, `docker --version`, `docker ps`, `.env` **con claves tapadas**, creación de AMI, EC2 B en otra zona.

## Para la sustentación

Explicar: por qué t3.small (RAM para construir la imagen y el panel), burstable vs fija, EBS gp3, por qué Linux, imagen vs contenedor, por qué Docker en vez de instalar Node a mano, qué es una AMI y por qué las claves deben ser iguales en A y B.
