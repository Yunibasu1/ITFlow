# Despliegue de n8n en un VPS (Docker + Caddy)

Despliega el workflow de clasificación de tickets de ITFlow en un servidor
privado virtual (Hetzner, DigitalOcean, etc.) accesible por Internet con HTTPS.

## Requisitos

- Un VPS con Docker y Docker Compose instalados (Ubuntu 22.04+).
- Un dominio que apunte al VPS con un registro `A` (p. ej. `n8n.tudominio.com` → `IP_DEL_VPS`).
- Puertos `80` y `443` abiertos en el firewall del VPS.

## Pasos

1. **Sube los archivos** de esta carpeta al VPS:

   ```bash
   scp docker-compose.yml Caddyfile .env.example root@IP_DEL_VPS:/opt/itflow-n8n/
   ```

2. **Crea el `.env`** en el VPS:

   ```bash
   ssh root@IP_DEL_VPS
   cd /opt/itflow-n8n
   cp .env.example .env
   nano .env   # rellena los valores
   ```

   Para heredar el workflow y las credenciales existentes, usa en
   `N8N_ENCRYPTION_KEY` el mismo valor que en el `.env` local (así el volume
   `n8n_data` se cifra con la misma clave). Si arrancas desde cero, deja la
   clave nueva y vuelve a importar `../workflows/01-ticket-classification.json`
   y a recrear la credencial del webhook.

3. **Levanta los contenedores**:

   ```bash
   docker compose up -d
   ```

4. **Verifica**:

   ```bash
   docker compose ps
   docker compose logs -f caddy   # debe emitir el certificado Let's Encrypt
   ```

   El panel queda en `https://n8n.tudominio.com` y el webhook en
   `https://n8n.tudominio.com/webhook/itflow/classify`.

## Actualizar el webhook en el frontend

En `frontend/.env.production` el webhook debe apuntar al dominio público:

```
VITE_N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/itflow/classify
VITE_N8N_WEBHOOK_SECRET=<el mismo N8N_WEBHOOK_SECRET del .env del VPS>
```

Luego `npm run build` en `frontend` y `firebase deploy` (Hosting) para publicar la app.

## Notas

- Caddy obtiene y renueva el certificado HTTPS automáticamente (Let's Encrypt).
- El workflow exportado está en `../workflows/01-ticket-classification.json`.
- Si n8n cae, la app sigue funcionando; solo se omite el análisis de IA.
