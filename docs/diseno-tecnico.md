# 📐 ITFlow — Diseño Técnico

## Sistema Inteligente de Gestión y Automatización de Incidencias TI

---

# 1. Resumen del documento

Este documento es la **guía oficial de desarrollo de ITFlow**. Define:

* La estructura exacta de Firestore.
* El diagrama de entidades.
* Las rutas y pantallas de la aplicación.
* Los permisos de cada rol.
* La especificación exacta de los workflows de n8n.

Aquí se toman decisiones concretas de diseño que se implementarán directamente en código.

---

# 2. Diagrama de entidades

```text
USERS ────────────────┐
│                     │
│ id                  │
│ name                │
│ lastname            │
│ email               │
│ role                │
│ department          │
│ position            │
│ phone               │
│ photoURL            │
│ status              │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
         │
         │ 1 crea N
         ▼
TICKETS ───────────────────┐
│                          │
│ id                       │
│ ticketNumber             │
│ title                    │
│ description              │
│ category                 │
│ subcategory              │
│ priority                 │
│ status                   │
│ userId ──────────────────┼──► users
│ assignedTo ──────────────┼──► users
│ department               │
│ aiAnalysis (subdocumento)│
│ sla (subdocumento)       │
│ createdAt                │
│ updatedAt                │
│ assignedAt               │
│ resolvedAt               │
│ closedAt                 │
└──────────────────────────┘
         │
         │ 1 tiene N
         ├───────────────────────┐
         ▼                       ▼
COMMENTS                  ATTACHMENTS
│                         │
│ id                      │ id
│ ticketId ──────────────►│ ticketId ──────────────► tickets
│ userId ────────────────►│ name
│ body                    │ type
│ createdAt               │ url
└─────────────────────────┘ size
                             createdAt
                             └──────────────────────

NOTIFICATIONS
│
│ id
│ userId ────────────────► users
│ ticketId ──────────────► tickets
│ type
│ title
│ body
│ read
│ createdAt
└────────────────────────

CATEGORIES
│
│ id
│ name
│ key
│ subcategories []
│ active
│ createdAt
└────────────────────────

EVALUATIONS
│
│ id
│ ticketId ──────────────► tickets
│ userId ────────────────► users
│ rating
│ comment
│ createdAt
└────────────────────────

AUDIT_LOGS
│
│ id
│ userId ────────────────► users
│ action
│ entity
│ entityId
│ before (map)
│ after (map)
│ createdAt
└────────────────────────

SLA_CONFIGS
│
│ id
│ priority
│ responseHours
│ resolutionHours
│ active
│ updatedAt
└────────────────────────

SYSTEM_CONFIGS
│
│ id
│ key
│ value
│ updatedAt
└────────────────────────
```

---

# 3. Estructura de Firestore

## 3.1 Colecciones principales

```text
Firestore
│
├── users
├── tickets
├── comments
├── attachments
├── notifications
├── categories
├── evaluations
├── audit_logs
├── sla_configs
└── system_configs
```

## 3.2 Colección `users`

**Ruta:** `users/{userId}`

| Campo     | Tipo        | Requerido | Descripción                     |
| --------- | ----------- | --------- | ------------------------------- |
| id        | string      | sí        | UID de Firebase Auth            |
| name      | string      | sí        | Nombre                          |
| lastname  | string      | sí        | Apellido                        |
| email     | string      | sí        | Correo electrónico              |
| role      | string      | sí        | `user`, `technician`, `admin`   |
| department| string      | no        | Departamento                    |
| position  | string      | no        | Cargo                           |
| phone     | string      | no        | Teléfono                        |
| photoURL  | string      | no        | Foto de perfil                  |
| status    | string      | sí        | `active`, `inactive`            |
| createdAt | timestamp   | sí        | Fecha de creación               |
| updatedAt | timestamp   | sí        | Fecha de actualización          |

**Reglas de negocio:**

* El UID de Firestore es igual al UID de Firebase Auth.
* Al registrarse, el rol inicial es `user`.
* El primer usuario registrado puede ser promovido a `admin` manualmente.

---

## 3.3 Colección `tickets`

**Ruta:** `tickets/{ticketId}`

| Campo           | Tipo        | Requerido | Descripción                          |
| --------------- | ----------- | --------- | ------------------------------------ |
| id              | string      | sí        | ID del documento                     |
| ticketNumber    | string      | sí        | Número legible `IT-000001`           |
| title           | string      | sí        | Título del problema                  |
| description     | string      | sí        | Descripción detallada                |
| category        | string      | no        | Clave de categoría (`network`)       |
| subcategory     | string      | no        | Clave de subcategoría (`wifi`)       |
| priority        | string      | no        | `low`, `medium`, `high`, `critical`  |
| status          | string      | sí        | Ver estados                          |
| userId          | string      | sí        | UID del usuario que lo creó          |
| assignedTo      | string      | no        | UID del técnico asignado             |
| department      | string      | no        | Departamento del usuario             |
| aiAnalysis      | map         | no        | Resultado del análisis de IA         |
| sla             | map         | no        | Datos de SLA del ticket              |
| createdAt       | timestamp   | sí        | Fecha de creación                    |
| updatedAt       | timestamp   | sí        | Fecha de actualización               |
| assignedAt      | timestamp   | no        | Fecha de asignación                  |
| resolvedAt      | timestamp   | no        | Fecha de resolución                  |
| closedAt        | timestamp   | no        | Fecha de cierre                      |

**Campo `aiAnalysis` (map):**

```json
{
  "category": "network",
  "subcategory": "wifi",
  "priority": "high",
  "summary": "Usuario sin conexión WiFi",
  "problem_type": "connectivity",
  "suggested_solution": "Verificar adaptador y conectividad",
  "model": "gpt-4o-mini",
  "analyzedAt": "2026-08-11T10:30:00Z"
}
```

**Campo `sla` (map):**

```json
{
  "responseHours": 2,
  "resolutionHours": 8,
  "responseDeadline": "2026-08-11T12:30:00Z",
  "resolutionDeadline": "2026-08-11T18:30:00Z",
  "responseMet": null,
  "resolutionMet": null,
  "violated": false
}
```

---

## 3.4 Estados de los tickets

Valores válidos para `status`:

| Estado         | Descripción                              |
| -------------- | ---------------------------------------- |
| `new`          | Creado, pendiente de análisis            |
| `analyzing`    | La IA está procesando                    |
| `pending`      | Analizado, esperando asignación          |
| `assigned`     | Asignado a un técnico                    |
| `in_progress`  | El técnico está trabajando               |
| `waiting_user` | Esperando respuesta del usuario          |
| `resolved`     | Solucionado, esperando confirmación      |
| `reopened`     | Reabierto porque el usuario lo rechazó   |
| `closed`       | Cerrado definitivamente                  |
| `escalated`    | Escalado por SLA vencido o criterio      |
| `cancelled`    | Cancelado                                |

**Flujo principal:**

```text
new → analyzing → pending → assigned → in_progress → resolved → closed
```

**Flujos alternativos:**

```text
in_progress → waiting_user → in_progress
resolved → reopened → in_progress
any (except closed/cancelled) → cancelled
any (except closed/cancelled) → escalated
```

---

## 3.5 Colección `comments`

**Ruta:** `comments/{commentId}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | ID del documento           |
| ticketId  | string    | sí        | Referencia al ticket       |
| userId    | string    | sí        | Quién comenta              |
| body      | string    | sí        | Contenido del comentario   |
| createdAt | timestamp | sí        | Fecha                      |

**Reglas de negocio:**

* Ordenados por `createdAt` ascendente.
* Cualquier participante del ticket puede comentar.

---

## 3.6 Colección `attachments`

**Ruta:** `attachments/{attachmentId}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | ID del documento           |
| ticketId  | string    | sí        | Referencia al ticket       |
| name      | string    | sí        | Nombre original del archivo|
| type      | string    | sí        | MIME type                  |
| url       | string    | sí        | URL de Firebase Storage    |
| size      | number    | sí        | Tamaño en bytes            |
| uploadedBy| string    | sí        | UID de quien lo subió      |
| createdAt | timestamp | sí        | Fecha                      |

**Reglas de negocio:**

* Límite de 5 MB por archivo.
* Formatos permitidos: imágenes, PDF, textos y capturas comunes.

---

## 3.7 Colección `notifications`

**Ruta:** `notifications/{notificationId}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | ID del documento           |
| userId    | string    | sí        | Destinatario               |
| ticketId  | string    | no        | Referencia al ticket       |
| type      | string    | sí        | Ver tipos                  |
| title     | string    | sí        | Título corto               |
| body      | string    | sí        | Cuerpo                     |
| read      | boolean   | sí        | Leída o no                 |
| createdAt | timestamp | sí        | Fecha                      |

**Tipos de notificación:**

```text
ticket_created
ticket_analyzed
ticket_assigned
ticket_updated
ticket_resolved
ticket_closed
ticket_reopened
sla_warning
sla_violated
evaluation_request
```

---

## 3.8 Colección `categories`

**Ruta:** `categories/{categoryId}`

| Campo          | Tipo    | Requerido | Descripción                |
| -------------- | ------- | --------- | -------------------------- |
| id             | string  | sí        | ID del documento           |
| name           | string  | sí        | Nombre visible (`Red`)     |
| key            | string  | sí        | Clave (`network`)          |
| subcategories  | array   | sí        | Lista de `{name, key}`     |
| active         | boolean | sí        | Activa o no                |
| createdAt      | timestamp| sí       | Fecha                      |

**Categorías iniciales:**

```text
hardware      → Hardware       [laptop, pc, monitor, teclado, mouse]
software      → Software       [instalacion, actualizacion, error, licencia]
network       → Red            [internet, wifi, vpn, servidor]
access        → Accesos        [correo, sistema, cuenta, permisos]
email         → Correo         [envio, recepcion, configuracion]
security      → Seguridad      [virus, phishing, contraseña]
printers      → Impresoras     [no imprime, atascada, configuracion]
systems       → Sistemas       [erp, crm, ventas, nomina]
other         → Otros          [general]
```

---

## 3.9 Colección `evaluations`

**Ruta:** `evaluations/{evaluationId}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | ID del documento           |
| ticketId  | string    | sí        | Referencia al ticket       |
| userId    | string    | sí        | Usuario que evalúa         |
| rating    | number    | sí        | 1 a 5                      |
| comment   | string    | no        | Comentario                 |
| createdAt | timestamp | sí        | Fecha                      |

**Reglas de negocio:**

* Un ticket solo puede tener una evaluación.
* La evaluación se crea después de cerrar el ticket.

---

## 3.10 Colección `audit_logs`

**Ruta:** `audit_logs/{logId}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | ID del documento           |
| userId    | string    | sí        | Quién realizó la acción    |
| action    | string    | sí        | Ver acciones               |
| entity    | string    | sí        | `ticket`, `user`, `config` |
| entityId  | string    | sí        | ID de la entidad           |
| before    | map       | no        | Estado anterior            |
| after     | map       | no        | Estado posterior           |
| createdAt | timestamp | sí        | Fecha                      |

**Acciones registradas:**

```text
TICKET_CREATED
TICKET_UPDATED
TICKET_ASSIGNED
TICKET_STATUS_CHANGED
TICKET_RESOLVED
TICKET_CLOSED
TICKET_REOPENED
TICKET_CANCELLED
TICKET_ESCALATED
USER_CREATED
USER_UPDATED
USER_ROLE_CHANGED
USER_STATUS_CHANGED
CATEGORY_CREATED
CATEGORY_UPDATED
CATEGORY_DELETED
SLA_CONFIG_UPDATED
SYSTEM_CONFIG_UPDATED
LOGIN
LOGOUT
```

---

## 3.11 Colección `sla_configs`

**Ruta:** `sla_configs/{priority}`

| Campo          | Tipo    | Requerido | Descripción                |
| -------------- | ------- | --------- | -------------------------- |
| id             | string  | sí        | `low`, `medium`, `high`, `critical` |
| responseHours  | number  | sí        | Horas para responder       |
| resolutionHours| number  | sí        | Horas para resolver        |
| active         | boolean | sí        | Activa o no                |
| updatedAt      | timestamp| sí       | Fecha                      |

**Valores por defecto:**

| Prioridad | Respuesta | Resolución |
| --------- | --------- | ---------- |
| critical  | 1 h       | 4 h        |
| high      | 2 h       | 8 h        |
| medium    | 4 h       | 24 h       |
| low       | 8 h       | 48 h       |

---

## 3.12 Colección `system_configs`

**Ruta:** `system_configs/{key}`

| Campo     | Tipo      | Requerido | Descripción                |
| --------- | --------- | --------- | -------------------------- |
| id        | string    | sí        | Clave de configuración     |
| value     | any       | sí        | Valor                      |
| updatedAt | timestamp | sí        | Fecha                      |

**Configuraciones previstas:**

```text
ticketPrefix        → "IT"
ticketStartNumber   → 1
notificationsEmail  → true
notificationsTelegram → false
notificationsDiscord → false
aiEnabled           → true
aiModel             → "gpt-4o-mini"
autoAssign          → true
```

---

# 4. Generación del número de ticket

El `ticketNumber` se genera de forma segura para evitar duplicados.

**Formato:**

```text
IT-000001
```

**Reglas de negocio:**

* El prefijo viene de `system_configs.ticketPrefix`.
* El contador se guarda en `system_configs.ticketCounter`.
* El incremento debe ser atómico (transacción de Firestore).
* Alternativa segura: usar un contador en un documento dedicado `system_configs/counters`.

**Ejemplo de transacción:**

```text
1. Iniciar transacción en `system_configs/counters`
2. Leer valor actual (ej. 124)
3. Incrementar a 125
4. Actualizar contador
5. Generar "IT-000125"
6. Crear ticket con ese número
```

---

# 5. Prioridades

Valores válidos:

```text
low
medium
high
critical
```

**Reglas de negocio:**

* La IA propone la prioridad inicial.
* El técnico puede ajustarla.
* Solo un técnico o administrador puede modificar la prioridad.
* Si la IA devuelve un valor inválido, n8n usa `medium` por defecto.

---

# 6. Rutas y pantallas de la aplicación

## 6.1 Rutas públicas

| Ruta              | Pantalla                    | Acceso     |
| ----------------- | --------------------------- | ---------- |
| `/login`          | Iniciar sesión              | público    |
| `/register`       | Registro                    | público    |
| `/forgot-password`| Recuperar contraseña        | público    |

## 6.2 Rutas de usuario

| Ruta                  | Pantalla                 | Rol   |
| --------------------- | ------------------------ | ----- |
| `/`                   | Redirección según rol    | todos |
| `/user`               | Dashboard del usuario    | user  |
| `/user/tickets`       | Mis incidencias          | user  |
| `/user/tickets/new`   | Crear incidencia         | user  |
| `/user/tickets/:id`   | Detalle de incidencia    | user  |
| `/profile`            | Mi perfil                | todos |

## 6.3 Rutas de técnico

| Ruta                  | Pantalla                 | Rol        |
| --------------------- | ------------------------ | ---------- |
| `/technician`         | Dashboard del técnico    | technician |
| `/technician/tickets` | Listado de tickets       | technician |
| `/technician/tickets/:id` | Detalle de ticket    | technician |

## 6.4 Rutas de administrador

| Ruta                  | Pantalla                 | Rol        |
| --------------------- | ------------------------ | ---------- |
| `/admin`              | Dashboard administrativo | admin      |
| `/admin/tickets`      | Todos los tickets        | admin      |
| `/admin/tickets/:id`  | Detalle de ticket        | admin      |
| `/admin/users`        | Gestión de usuarios      | admin      |
| `/admin/technicians`  | Gestión de técnicos      | admin      |
| `/admin/categories`   | Gestión de categorías    | admin      |
| `/admin/reports`      | Reportes y estadísticas  | admin      |
| `/admin/sla`          | Configuración de SLA     | admin      |
| `/admin/audit`        | Registro de auditoría    | admin      |
| `/admin/settings`     | Configuración general    | admin      |

## 6.5 Protección de rutas

Cada ruta protegida verifica:

```text
1. ¿Hay sesión activa?
   → No: redirigir a /login
2. ¿El rol tiene acceso a esta ruta?
   → No: redirigir a la ruta de su rol
```

**Componente guard:**

```text
<ProtectedRoute role="admin">
  <AdminDashboard />
</ProtectedRoute>
```

---

# 7. Permisos por rol

## 7.1 Matriz de permisos

| Acción                         | Usuario | Técnico | Admin |
| ------------------------------ | ------- | ------- | ----- |
| Crear ticket                   | ✅      | ✅      | ✅    |
| Ver sus propios tickets        | ✅      | ✅      | ✅    |
| Ver tickets asignados          | ❌      | ✅      | ✅    |
| Ver todos los tickets          | ❌      | ❌      | ✅    |
| Comentar en ticket participado | ✅      | ✅      | ✅    |
| Adjuntar archivos              | ✅      | ✅      | ✅    |
| Aceptar/asignarse ticket       | ❌      | ✅      | ✅    |
| Reasignar ticket               | ❌      | ❌      | ✅    |
| Cambiar estado                 | ❌      | ✅      | ✅    |
| Cambiar prioridad              | ❌      | ✅      | ✅    |
| Registrar solución             | ❌      | ✅      | ✅    |
| Cerrar ticket                  | ✅      | ✅      | ✅    |
| Confirmar solución             | ✅      | ❌      | ❌    |
| Reabrir ticket                 | ✅      | ✅      | ✅    |
| Evaluar atención               | ✅      | ❌      | ❌    |
| Gestionar usuarios             | ❌      | ❌      | ✅    |
| Gestionar técnicos             | ❌      | ❌      | ✅    |
| Gestionar categorías           | ❌      | ❌      | ✅    |
| Configurar SLA                 | ❌      | ❌      | ✅    |
| Consultar auditoría            | ❌      | ❌      | ✅    |
| Consultar estadísticas         | ✅ (propias) | ✅ (propias) | ✅ (todas) |
| Ver reporte semanal            | ❌      | ❌      | ✅    |

## 7.2 Reglas de Firestore (conceptuales)

### users

```text
- user: solo puede leer y actualizar su propio documento
- technician: solo puede leer su propio documento y datos básicos de usuarios
- admin: lectura y escritura de todos
```

### tickets

```text
- Crear: cualquier usuario autenticado
- Leer:
  - user → solo tickets donde userId == auth.uid
  - technician → tickets donde assignedTo == auth.uid
  - admin → todos
- Actualizar:
  - user → solo confirmar solución o cerrar tickets propios
  - technician → tickets asignados a él
  - admin → todos
- Borrar: nadie (los tickets no se eliminan)
```

### comments

```text
- Crear: quien participa en el ticket
- Leer: quien participa en el ticket
- Actualizar/Borrar: solo admin
```

### attachments

```text
- Crear: quien participa en el ticket
- Leer: quien participa en el ticket
```

### notifications

```text
- Leer: solo el destinatario (userId == auth.uid)
- Marcar como leída: solo el destinatario
```

### evaluations

```text
- Crear: el dueño del ticket, una sola vez
- Leer: técnico asignado y admin
```

### audit_logs

```text
- Leer: solo admin
- Escribir: solo servidor/n8n (mediante reglas o cuenta de servicio)
```

### sla_configs y system_configs

```text
- Leer: todos los autenticados (solo los necesarios)
- Escribir: solo admin
```

---

# 8. Diseño de los workflows de n8n

## 8.1 Conexión Firebase → n8n

Se usará una de las siguientes estrategias:

1. **Webhook por trigger de n8n** — el frontend o una Cloud Function llama al webhook.
2. **Firebase Cloud Functions + Eventarc** — un evento de Firestore dispara la función que llama al webhook de n8n.
3. **Trigger de n8n a Firestore** — n8n consulta Firestore por polling (ej. cada 15 min).

**Decisión:** Se usará **webhook de n8n con petición HTTP desde una Cloud Function** para los eventos en tiempo real, y **polling** para los procesos periódicos (SLA, reportes).

---

## 8.2 Workflow 01 — Clasificación de nuevo ticket

**Trigger:** Webhook `POST /webhook/ticket-created`

**Body esperado:**

```json
{
  "ticketId": "abc123",
  "title": "No puedo conectarme a Internet",
  "description": "Desde esta mañana no tengo conexión."
}
```

**Pasos:**

```text
1. Webhook recibe el ticket
2. Validar que ticketId, title y description existen
3. Buscar el ticket en Firestore (verificar que status == "new")
4. Actualizar ticket a status = "analyzing"
5. Enviar a la IA: title + description con prompt estructurado
6. Recibir JSON de la IA
7. Validar la respuesta (campos y valores permitidos)
8. Si es inválida → usar valores por defecto
9. Actualizar Firestore:
   - category
   - subcategory
   - priority
   - aiAnalysis
   - sla (calcular plazos según sla_configs)
   - status = "pending"
10. Crear notificación para el área correspondiente
11. Registrar audit_log (TICKET_UPDATED / análisis completado)
```

**Prompt de la IA (plantilla):**

```text
Analiza la siguiente incidencia de soporte TI.
Responde SOLO con JSON válido y sin texto adicional.

Título: {{title}}
Descripción: {{description}}

Categorías disponibles: hardware, software, network, access, email, security, printers, systems, other
Prioridades: low, medium, high, critical

Formato de respuesta:
{
  "category": "string",
  "subcategory": "string",
  "priority": "string",
  "summary": "string (máx 60 caracteres)",
  "problem_type": "string",
  "suggested_solution": "string"
}
```

**Validación de la respuesta:**

```text
- category ∈ categorías activas → si no, "other"
- priority ∈ [low, medium, high, critical] → si no, "medium"
- summary: recortar a 60 caracteres
- subcategory: si no existe en la categoría → vacío
```

---

## 8.3 Workflow 02 — Notificación de ticket

**Trigger:** Evento de actualización en Firestore (Cloud Function → webhook)

**Body esperado:**

```json
{
  "ticketId": "abc123",
  "event": "assigned" | "resolved" | "reopened" | "comment" | ...
}
```

**Pasos:**

```text
1. Recibir evento
2. Obtener el ticket
3. Determinar destinatarios según el evento:
   - assigned → técnico asignado
   - resolved → usuario creador
   - closed → usuario creador
   - reopened → técnico asignado
   - comment → participantes del ticket
4. Crear notificación en Firestore
5. Enviar por los canales activos:
   - Email (Gmail)
   - Telegram (si está habilitado)
   - Discord (si está habilitado)
6. Registrar audit_log si aplica
```

**Plantillas de mensajes:**

**Asignado (técnico):**

```text
📋 Nuevo ticket asignado

IT-000201 — No puedo acceder al sistema de ventas
Prioridad: Alta
Usuario: Juan Pérez
```

**Resuelto (usuario):**

```text
✅ Tu incidencia IT-000125 fue marcada como resuelta.

¿El problema fue solucionado?
[Sí] [No]
```

**Reabierto (técnico):**

```text
🔄 El ticket IT-000125 fue reabierto por el usuario.

Motivo: El problema continúa.
```

---

## 8.4 Workflow 03 — Ticket crítico

**Trigger:** Webhook `POST /webhook/critical-ticket` (llamado por la Cloud Function cuando priority == "critical")

**Pasos:**

```text
1. Recibir el ticket
2. Buscar técnicos del área correspondiente
3. Notificar al técnico disponible (email + Telegram)
4. Notificar al administrador
5. Crear notificaciones en Firestore
6. Registrar audit_log (TICKET_ESCALATED si aplica)
7. Si no hay técnico disponible → marcar como escalated
```

**Mensaje:**

```text
🚨 TICKET CRÍTICO

IT-000250 — Fallo en servidor de ventas
Afecta: Sistema de ventas completo
Requiere atención inmediata.
```

---

## 8.5 Workflow 04 — Monitor de SLA

**Trigger:** Schedule, cada 15 minutos

**Pasos:**

```text
1. Consultar tickets activos (no closed, no cancelled)
2. Para cada ticket calcular:
   - tiempo transcurrido desde createdAt
   - tiempo transcurrido desde assignedAt
   - plazo de respuesta (responseDeadline)
   - plazo de resolución (resolutionDeadline)
3. Clasificar:
   - SLA próximo a vencer (menos del 25% del plazo restante) → alerta
   - SLA vencido → workflow de SLA vencido
   - SLA cumplido → marcar responseMet/resolutionMet
4. Crear notificaciones de tipo sla_warning
5. Enviar alertas
6. Registrar auditoría
```

---

## 8.6 Workflow 05 — SLA vencido

**Trigger:** Parte del monitor de SLA (tickets con deadline vencido)

**Pasos:**

```text
1. Recibir el ticket vencido
2. Actualizar Firestore:
   - sla.violated = true
   - sla.responseMet = false (o resolutionMet)
3. Cambiar estado a escalated (si aplica)
4. Notificar al administrador
5. Notificar al técnico asignado
6. Registrar audit_log (TICKET_ESCALATED + SLA vencido)
```

**Mensaje al administrador:**

```text
⚠️ SLA vencido

Ticket IT-000300 superó su plazo.
Prioridad: Alta
Tiempo límite: 8 horas
Técnico: Carlos
```

---

## 8.7 Workflow 06 — Ticket resuelto

**Trigger:** Evento de Firestore: status cambia a `resolved`

**Pasos:**

```text
1. Recibir el ticket
2. Verificar que el cambio fue realizado por el técnico asignado o admin
3. Actualizar resolvedAt
4. Registrar sla.resolutionMet
5. Notificar al usuario creador
6. Crear notificación en Firestore (ticket_resolved)
7. Registrar audit_log (TICKET_RESOLVED)
```

---

## 8.8 Workflow 07 — Cierre y reapertura

**Trigger:** Evento de Firestore: status cambia a `closed` o `reopened`

**Pasos (cerrado):**

```text
1. Recibir el ticket
2. Verificar que el usuario confirmó la solución
3. Actualizar closedAt
4. Crear evaluación pendiente (o enviar encuesta)
5. Registrar audit_log (TICKET_CLOSED)
6. Actualizar métricas del dashboard
```

**Pasos (reabierto):**

```text
1. Recibir el ticket
2. Notificar al técnico asignado
3. Crear notificación (ticket_reopened)
4. Registrar audit_log (TICKET_REOPENED)
5. Reiniciar contadores de SLA si aplica
```

---

## 8.9 Workflow 08 — Encuesta de satisfacción

**Trigger:** Evento de Firestore: ticket cerrado

**Pasos:**

```text
1. Detectar que el ticket pasó a closed
2. Crear notificación de tipo evaluation_request para el usuario
3. El usuario califica en la app (1 a 5 + comentario)
4. Guardar en evaluations
5. Si rating < 3 → notificar al administrador
6. Actualizar métricas de satisfacción
```

**Decisión:** la encuesta se muestra dentro de la aplicación (no por email), con opción de cerrarla.

---

## 8.10 Workflow 09 — Reporte semanal

**Trigger:** Schedule, cada viernes a las 18:00

**Pasos:**

```text
1. Consultar tickets de la semana
2. Calcular:
   - tickets recibidos
   - tickets resueltos
   - tickets pendientes
   - % SLA cumplido
   - categoría principal
   - tiempo promedio de resolución
   - satisfacción promedio
3. Generar reporte (HTML o PDF)
4. Enviar al administrador por email
5. Guardar copia del reporte si aplica
```

**Plantilla del reporte:**

```text
📊 Reporte semanal ITFlow

Tickets recibidos: 84
Resueltos: 78
Pendientes: 6

SLA cumplido: 94%

Categoría principal: Red

Tiempo promedio: 2h 14min

Satisfacción: 4.6/5
```

---

## 8.11 Resumen de workflows

| #  | Nombre                | Trigger        | Frecuencia     |
| -- | --------------------- | -------------- | -------------- |
| 01 | Clasificación IA      | Webhook        | por ticket     |
| 02 | Notificaciones        | Webhook/evento | por evento     |
| 03 | Ticket crítico        | Webhook/evento | por ticket     |
| 04 | Monitor SLA           | Schedule       | cada 15 min    |
| 05 | SLA vencido           | Workflow 04    | condicional    |
| 06 | Ticket resuelto       | Evento         | por evento     |
| 07 | Cierre/reapertura     | Evento         | por evento     |
| 08 | Encuesta              | Evento         | por cierre     |
| 09 | Reporte semanal       | Schedule       | viernes 18:00  |

---

# 9. Conexión entre sistemas

## 9.1 React → Firebase

```text
login, registro, logout        → Firebase Auth
usuarios                       → Firestore
tickets                        → Firestore
comentarios                    → Firestore
archivos                       → Firebase Storage
notificaciones                 → Firestore
```

## 9.2 Firebase → n8n

**Puente recomendado:** Firebase Cloud Functions + Eventarc.

```text
Cambio en Firestore
      ↓
Cloud Function
      ↓
HTTP request al webhook de n8n
      ↓
Workflow de n8n
```

**Fallback:** n8n consulta Firestore por polling (para SLA y reportes).

## 9.3 n8n → IA

```text
n8n → HTTP → API del proveedor (OpenAI/Anthropic/Gemini)
      ↓
JSON estructurado
      ↓
Validación en n8n
      ↓
Actualizar Firestore
```

## 9.4 n8n → servicios externos

```text
Gmail
Telegram
Discord
```

## 9.5 n8n → Firebase

```text
Actualizar tickets (categoría, prioridad, estado)
Crear notificaciones
Registrar audit_logs
```

---

# 10. Seguridad

## 10.1 Niveles de seguridad

```text
1. Firebase Authentication (identidad)
2. Firestore Security Rules (acceso a datos)
3. Storage Security Rules (acceso a archivos)
4. Validación de datos en frontend y backend
5. Control de roles
6. Auditoría de acciones
7. Variables de entorno (nunca claves en el frontend)
```

## 10.2 Variables de entorno

**Frontend (`.env`):**

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**n8n (credenciales):**

```text
FIREBASE_SERVICE_ACCOUNT (JSON)
OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY
GMAIL_OAUTH
TELEGRAM_BOT_TOKEN
DISCORD_WEBHOOK_URL
N8N_WEBHOOK_SECRET
```

---

# 11. Arquitectura del frontend (definitiva)

```text
itflow/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── tickets/
│   │   ├── dashboard/
│   │   └── notifications/
│   ├── pages/
│   │   ├── auth/Login.tsx
│   │   ├── auth/Register.tsx
│   │   ├── auth/ForgotPassword.tsx
│   │   ├── user/Dashboard.tsx
│   │   ├── user/MyTickets.tsx
│   │   ├── user/CreateTicket.tsx
│   │   ├── user/TicketDetail.tsx
│   │   ├── technician/Dashboard.tsx
│   │   ├── technician/Tickets.tsx
│   │   ├── technician/TicketDetail.tsx
│   │   ├── admin/Dashboard.tsx
│   │   ├── admin/Users.tsx
│   │   ├── admin/Reports.tsx
│   │   ├── admin/Categories.tsx
│   │   ├── admin/AuditLogs.tsx
│   │   ├── admin/SlaConfig.tsx
│   │   └── admin/Settings.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── tickets.ts
│   │   ├── users.ts
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── webhooks.ts
│   ├── hooks/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── types/
│   │   ├── User.ts
│   │   ├── Ticket.ts
│   │   ├── Comment.ts
│   │   ├── Notification.ts
│   │   ├── Evaluation.ts
│   │   └── Category.ts
│   ├── utils/
│   ├── routes/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 12. Índices de Firestore

Se necesitarán índices compuestos para las consultas frecuentes:

```text
1. tickets
   - userId + createdAt (desc)
   - userId + status
   - assignedTo + status
   - assignedTo + createdAt (desc)
   - status + priority
   - status + createdAt (desc)
   - createdAt (desc) para dashboard

2. comments
   - ticketId + createdAt (asc)

3. notifications
   - userId + read
   - userId + createdAt (desc)

4. audit_logs
   - userId + createdAt (desc)
   - action + createdAt (desc)

5. evaluations
   - ticketId
   - createdAt (desc)
```

---

# 13. Dashboard — consultas necesarias

## 13.1 Dashboard de usuario

```text
Mis incidencias
- total:   count(tickets where userId == me)
- abiertas: count(tickets where userId == me and status not in [closed, cancelled])
- resueltas: count(tickets where userId == me and status in [resolved, closed])
```

## 13.2 Dashboard de técnico

```text
Mis tickets
- nuevos:       tickets where assignedTo == me and status == pending
- en progreso:  tickets where assignedTo == me and status == in_progress
- pendientes:   tickets where assignedTo == me and status in [assigned, waiting_user]
- resueltos:    tickets where assignedTo == me and status == resolved
```

## 13.3 Dashboard administrativo

```text
- total tickets:      count(tickets)
- abiertos:           tickets where status not in [closed, cancelled]
- resueltos:          tickets where status in [resolved, closed]
- críticos:           tickets where priority == critical and status not in [closed, cancelled]
- tickets por día:    group by date(createdAt) last 7 días
- por categoría:      group by category
- por técnico:        group by assignedTo
- % SLA cumplido:     avg(sla.responseMet / resolutionMet)
- satisfacción:       avg(evaluations.rating)
```

---

# 14. Definición de tipos TypeScript (referencia)

## 14.1 Ticket.ts

```typescript
export type TicketStatus =
  | "new"
  | "analyzing"
  | "pending"
  | "assigned"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "reopened"
  | "closed"
  | "escalated"
  | "cancelled";

export type Priority = "low" | "medium" | "high" | "critical";

export interface AiAnalysis {
  category: string;
  subcategory: string;
  priority: Priority;
  summary: string;
  problem_type: string;
  suggested_solution: string;
  model: string;
  analyzedAt: Date;
}

export interface SlaInfo {
  responseHours: number;
  resolutionHours: number;
  responseDeadline: Date;
  resolutionDeadline: Date;
  responseMet: boolean | null;
  resolutionMet: boolean | null;
  violated: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: Priority;
  status: TicketStatus;
  userId: string;
  assignedTo: string | null;
  department: string;
  aiAnalysis: AiAnalysis | null;
  sla: SlaInfo | null;
  createdAt: Date;
  updatedAt: Date;
  assignedAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
}
```

## 14.2 User.ts

```typescript
export type Role = "user" | "technician" | "admin";

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  phone: string;
  photoURL: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
```

## 14.3 Notification.ts

```typescript
export type NotificationType =
  | "ticket_created"
  | "ticket_analyzed"
  | "ticket_assigned"
  | "ticket_updated"
  | "ticket_resolved"
  | "ticket_closed"
  | "ticket_reopened"
  | "sla_warning"
  | "sla_violated"
  | "evaluation_request";

export interface Notification {
  id: string;
  userId: string;
  ticketId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}
```

---

# 15. Orden de implementación

Este es el orden sugerido para construir ITFlow:

| Orden | Tarea                          | Depende de            |
| ----- | ------------------------------ | --------------------- |
| 1     | Proyecto React + Vite + TS + Tailwind | —              |
| 2     | Configurar Firebase (proyecto, Auth, Firestore) | 1          |
| 3     | Auth: registro, login, logout  | 2                     |
| 4     | Modelo de usuarios + roles     | 3                     |
| 5     | CRUD de categorías             | 4                     |
| 6     | Crear ticket (sin IA)          | 5                     |
| 7     | Listar y filtrar tickets       | 6                     |
| 8     | Detalle de ticket + comentarios| 7                     |
| 9     | Adjuntar archivos (Storage)    | 8                     |
| 10    | Dashboard de usuario           | 9                     |
| 11    | Flujo de técnico               | 9                     |
| 12    | Flujo de administrador         | 11                    |
| 13    | n8n local + webhook de prueba  | 11                    |
| 14    | Clasificación con IA           | 13                    |
| 15    | Notificaciones                 | 14                    |
| 16    | SLA                            | 15                    |
| 17    | Encuesta de satisfacción       | 16                    |
| 18    | Reporte semanal                | 17                    |
| 19    | Seguridad final + auditoría    | 18                    |
| 20    | Despliegue (Hosting + n8n)     | 19                    |

---

## ✅ Documento de diseño técnico completado

Con este documento tenemos definido:

- Estructura de Firestore con todas las colecciones y campos.
- Diagrama de entidades.
- Estados, prioridades y reglas de negocio.
- Rutas y pantallas.
- Matriz de permisos y reglas de seguridad.
- Especificación exacta de los 9 workflows de n8n.
- Conexiones entre sistemas.
- Variables de entorno.
- Índices de Firestore.
- Consultas de los dashboards.
- Tipos de TypeScript de referencia.
- Orden de implementación.

El siguiente paso es **crear el proyecto y escribir la primera línea de código** (Fase 1: Base).
