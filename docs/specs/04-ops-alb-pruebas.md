# 04 · Ops: balanceador, tolerancia a fallos y pruebas E2E

**Responsable:** colega 3 · **Depende de:** 02 (SG y subredes) y 03 (EC2 A y B)

## Puede adelantar sin esperar

- Crear el target group vacío y el ALB (pasos 1–2) apenas 02 termine.
- Preparar la plantilla de la tabla de pruebas y el guion de la demo.

## Alcance

1. **Target group `novatech-tg`:** tipo Instances, HTTP, puerto **1337**, VPC del proyecto. Health check: ruta `/_health`, códigos `200-204`, intervalo 10 s, umbral sano 2, umbral no sano 2.
2. **ALB `novatech-alb`:** Internet-facing, subredes de `us-east-1a` y `us-east-1b`, SG `novatech-sg-alb`, listener HTTP:80 → `novatech-tg`.
3. Registrar EC2 A y B en el target group cuando 03 las entregue.
4. Cerrar en `novatech-sg-web` cualquier acceso temporal a 1337 desde Internet (solo desde el ALB).
5. Ejecutar las pruebas y documentarlas.

## Pruebas E2E (todo por `http://<dns-alb>`)

**A · Funcionalidad**

| # | Acción | Esperado |
|---|---|---|
| A1 | Abrir `/` | Tienda con imagen, nombre, descripción y precio |
| A2 | Abrir `/api/products` | JSON con los mismos productos |
| A3 | En `/admin` agregar "Mouse X · S/ 59" | Aparece en `/` |
| A4 | En `/admin` eliminar ese producto | Desaparece de `/` |

**B · Disponibilidad**

| # | Acción | Esperado |
|---|---|---|
| B1 | Ver target group | A y B *healthy* |
| B2 | Recargar `/` 10 veces | "Atendido por" alterna EC2 A / EC2 B |
| B3 | Detener EC2 A | A pasa a *unhealthy* (~20–30 s); `/` sigue funcionando |
| B4 | Con A detenida, agregar y eliminar un producto | Funciona |
| B5 | Iniciar EC2 A | Vuelve a *healthy* y muestra los cambios de B4 |

## Entregables

- DNS del ALB.
- Tabla de pruebas con resultado (OK/Falla), hora y captura por fila.
- Video de 1–2 min de B3–B5 (respaldo para la exposición).

## Criterios de aceptación

- [ ] Todas las pruebas A y B en OK.
- [ ] Desde Internet, la IP de una EC2 en el puerto 1337 **no** responde (solo el ALB).

## Evidencia

`evidencias/04/`: target group y health check, ALB con 2 zonas, cada prueba, video.

## Para la sustentación

Explicar: cómo decide el ALB a qué instancia enviar (round robin), qué hace el health check, qué pasa si caen las dos, y Auto Scaling Group como mejora.
