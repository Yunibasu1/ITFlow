# ITFlow · n8n + IA

Automatiza la **clasificación de tickets con IA** (Google Gemini): cuando un usuario
crea una incidencia, el frontend llama al webhook de n8n, este envía el ticket a
Gemini y escribe el análisis (`aiAnalysis`) de vuelta en Firestore.

La app **sigue funcionando sin n8n**: si n8n está caído, solo queda pendiente el
análisis IA.

## Arquitectura

```
Crear ticket (React)
        │  POST /webhook/itflow/classify
        ▼
     n8n (Webhook)
        │
        ▼
  Preparar prompt (envuelve el body del webhook + prompt)
        │
        ▼
  Gemini (clasifica: categoría, prioridad, resumen, solución)
        │
        ▼
  Extraer y validar (JSON de Gemini → estructura Firestore)
        │
        ▼
  Guardar en Firestore (Code node: JWT + PATCH tickets/{id} → aiAnalysis)
```

> **Por qué un Code node para Firestore**: el nodo HTTP Request v3 de n8n **no
> soporta** la credencial `googleApi` (solo `httpBasicAuth`, `httpBearerAuth`,
> `httpDigestAuth`, `httpHeaderAuth`, `httpQueryAuth`, `httpCustomAuth`,
> `httpTemplatedCustomAuth`, `oAuth1Api`, `oAuth2Api`), así que nunca adjuntaba el
> `Authorization: Bearer` y Firestore respondía 403. La solución es un **Code node**
> que firma un JWT RS256 con la cuenta de servicio y hace el PATCH con `require('https')`
> (en el sandbox de n8n no existen `fetch` ni `process.env`; se usa `$env` y
> `NODE_FUNCTION_ALLOW_BUILTIN`).

## 1. Requisitos

- Docker (con `docker compose`).
- Cuenta de Google para obtener la API key de Gemini.

## 2. Clave de Gemini (gratis)

1. Entra en https://aistudio.google.com/apikey
2. Inicia sesión con tu cuenta de Google.
3. Crea una API key y cópiala.

## 3. Configurar n8n

En la carpeta `n8n`:

```powershell
Copy-Item .env.example .env
```

Edita `n8n/.env`:

- `N8N_ENCRYPTION_KEY`: texto aleatorio de 32+ caracteres.
- `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD`: credenciales del panel n8n.
- `N8N_WEBHOOK_SECRET`: **debe coincidir** con `VITE_N8N_WEBHOOK_SECRET` de
  `frontend/.env` (ya viene un valor generado ahí).
- `GEMINI_API_KEY`: la clave del paso 2.
- `GOOGLE_CLOUD_PROJECT`: el project ID de Firebase (ej. `itflow-4a74b`).
- `NODE_FUNCTION_ALLOW_BUILTIN`: `crypto,fs,https,http` (permite `require` de
  módulos Node en los Code nodes).
- `GOOGLE_SERVICE_ACCOUNT_JSON`: el JSON de la cuenta de servicio del paso 5,
  **aplanado a una sola línea** (el Code node lo lee desde `$env`).

Para generar `GOOGLE_SERVICE_ACCOUNT_JSON` a una línea desde PowerShell:

```powershell
$j = Get-Content -Raw .\google-service-account.json | ConvertFrom-Json
"GOOGLE_SERVICE_ACCOUNT_JSON=$(( $j | ConvertTo-Json -Compress -Depth 10 ))" >> .env
```

## 4. Levantar n8n

```powershell
docker compose up -d
```

Panel: http://localhost:5678 (con el usuario/contraseña de `N8N_BASIC_AUTH_*`).

## 5. Servicio de Google para escribir en Firestore

n8n necesita una **cuenta de servicio** para actualizar los tickets (la misma usa
el SDK, pero desde el servidor):

1. Ve a https://console.cloud.google.com → selecciona el proyecto de ITFlow.
2. **IAM y administración → Cuentas de servicio → Crear cuenta de servicio**.
   - Nombre: `itflow-n8n`.
   - Rol: **Cloud Datastore User** (permite leer/escribir Firestore).
   - Crear.
3. Abre la cuenta creada → pestaña **Claves → Agregar clave → Crear nueva clave →
   JSON** → descarga el archivo.

## 6. Importar el workflow

1. En n8n: **Workflows → Import from File** y selecciona
   `n8n/workflows/01-ticket-classification.json`.
2. Crea la credencial **Webhook API** (tipo `httpHeaderAuth`): *Name* = `x-itflow-secret`,
   *Value* = el mismo valor de `N8N_WEBHOOK_SECRET`. Guárdala como `Webhook itflow`.
3. Asigna la credencial en el editor: nodo **Webhook** → *Authentication → Header Auth*
   → selecciona `Webhook itflow`.
4. Activa el workflow (interruptor arriba a la derecha).

> ⚠️ **Importante**: la autenticación del Webhook usa la **credencial** de tipo
> `httpHeaderAuth` (Name `x-itflow-secret`). Configurarla "a mano" en el nodo con
> los campos `httpHeader`/`httpHeaderValue` **no se aplica** en n8n 2.x.

> 💡 **No hace falta crear credencial de Google**: el nodo **Guardar en Firestore**
> lee `$env.GOOGLE_SERVICE_ACCOUNT_JSON` (configurado en `.env`), firma un JWT y
> actualiza Firestore directamente.

## 7. Probar

1. Recarga la app (`Ctrl + F5` en el navegador).
2. Crea un ticket nuevo.
3. En n8n verás una ejecución exitosa en **Executions**.
4. Abre el ticket: aparecerá el panel **🤖 Análisis de IA** con categoría,
   prioridad sugerida, resumen y solución sugerida (tarda unos segundos).

## Notas

- El webhook devuelve la respuesta de inmediato; el análisis se escribe después.
- Si la API de Gemini falla, el workflow deja una ejecución con error y el ticket
  simplemente no recibe análisis (no rompe la app).
- Para depurar: en n8n abre la ejecución en *Executions* y revisa cada nodo.
- El **Code node** de Firestore necesita `NODE_FUNCTION_ALLOW_BUILTIN` (para
  `require('crypto')` y `require('https')`) y `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
  (para poder leer `$env.GOOGLE_SERVICE_ACCOUNT_JSON` desde un Code node). Ambos
  ya vienen en `docker-compose.yml` y `.env.example`.
- Los parámetros de los nodos solo se evalúan como expresión si el valor empieza
  por `=` (p. ej. la URL y el header de Gemini usan `={{ $env.GEMINI_API_KEY }}`).
