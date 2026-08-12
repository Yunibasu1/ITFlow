Sí. Vamos a dejar **ITFlow definido como un proyecto completo**, con arquitectura, módulos, funcionalidades, procesos, base de datos, workflows de n8n, seguridad y despliegue. La idea es que este documento te sirva prácticamente como **plan maestro para desarrollarlo**.

# 🚀 ITFlow

## Sistema Inteligente de Gestión y Automatización de Incidencias TI

---

# 1. Concepto general del proyecto

**ITFlow** será una plataforma web para que una empresa pueda gestionar de manera centralizada las solicitudes e incidencias de soporte técnico.

El sistema permitirá que los trabajadores registren problemas desde una página web y que el equipo de soporte pueda recibirlos, clasificarlos, asignarlos, atenderlos y cerrarlos.

La diferencia respecto a un simple sistema CRUD será la incorporación de:

* **Firebase** para autenticación, base de datos y almacenamiento.
* **n8n** para automatizar procesos.
* **IA** para analizar y clasificar las incidencias.
* **Notificaciones automáticas**.
* **SLA** para controlar tiempos de atención.
* **Dashboard** para analizar el rendimiento.
* **Auditoría** para registrar las acciones realizadas.

La idea central será:

```text
                 USUARIO
                    │
                    ↓
             CREA INCIDENCIA
                    │
                    ↓
                FIREBASE
                    │
                    ↓
                   n8n
                    │
             ┌──────┴──────┐
             ↓             ↓
            IA        AUTOMATIZACIÓN
             │             │
             ↓             ↓
        Clasificación   Notificación
        Prioridad       Asignación
        Resumen         SLA
             │             │
             └──────┬──────┘
                    ↓
               TÉCNICO TI
                    │
                    ↓
                RESUELVE
                    │
                    ↓
                 USUARIO
                    │
                    ↓
                EVALUACIÓN
```

---

# 2. Problema que resolverá

En muchas empresas las solicitudes de soporte se gestionan mediante diferentes canales:

```text
WhatsApp
Telegram
Correo
Excel
Llamadas
Mensajes internos
```

Esto puede provocar:

* información dispersa;
* tickets olvidados;
* dificultad para conocer quién atiende cada problema;
* falta de seguimiento;
* problemas para medir tiempos;
* ausencia de estadísticas;
* duplicación de solicitudes;
* dificultad para determinar prioridades.

ITFlow centralizará todo en una única plataforma.

---

# 3. Objetivo general

### Objetivo

Desarrollar una plataforma web inteligente para centralizar, gestionar y automatizar las incidencias de soporte TI, utilizando Firebase como plataforma de servicios en la nube, n8n como motor de automatización e inteligencia artificial como apoyo para la clasificación y priorización de incidencias.

---

# 4. Objetivos específicos

### OE1

Permitir que los usuarios registren incidencias desde una plataforma web.

### OE2

Centralizar las incidencias en una base de datos.

### OE3

Permitir que los técnicos gestionen y actualicen las incidencias.

### OE4

Automatizar la clasificación de las incidencias mediante IA.

### OE5

Generar una prioridad sugerida de acuerdo con la información registrada.

### OE6

Automatizar las notificaciones mediante n8n.

### OE7

Controlar los tiempos de atención mediante SLA.

### OE8

Registrar el historial de acciones realizadas.

### OE9

Generar indicadores y estadísticas del área de soporte.

### OE10

Permitir evaluar la satisfacción del usuario después de resolver una incidencia.

---

# 5. 👥 Tipos de usuarios

Tendremos tres roles principales.

## 5.1 Usuario

Es el trabajador que necesita soporte.

### Puede:

* iniciar sesión;
* crear tickets;
* ver sus tickets;
* consultar el estado;
* agregar comentarios;
* adjuntar imágenes;
* responder al técnico;
* confirmar solución;
* calificar la atención.

### No puede:

* ver tickets de otros usuarios;
* modificar configuraciones;
* gestionar técnicos;
* acceder al panel administrativo.

---

# 6. 👨‍💻 Técnico

Es el responsable de atender las incidencias.

### Puede:

* visualizar tickets;
* filtrar tickets;
* aceptar tickets;
* asignarse tickets;
* cambiar estados;
* agregar comentarios;
* adjuntar evidencias;
* registrar soluciones;
* cerrar incidencias;
* consultar su rendimiento.

---

# 7. 👨‍💼 Administrador

Tiene control completo.

### Puede:

* administrar usuarios;
* administrar técnicos;
* administrar categorías;
* visualizar todos los tickets;
* reasignar tickets;
* consultar estadísticas;
* configurar SLA;
* consultar auditoría;
* administrar configuraciones.

---

# 8. 🏗️ Arquitectura completa

La arquitectura sería:

```text
                              INTERNET
                                  │
                                  ↓
                     ┌─────────────────────┐
                     │      ITFlow         │
                     │   React + TypeScript│
                     └──────────┬──────────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
               ↓                ↓                ↓
       Firebase Auth       Firestore         Storage
               │                │                │
               │                │                │
               │                ↓                ↓
               │             Tickets          Archivos
               │             Usuarios          Imágenes
               │             Comentarios       PDFs
               │
               └────────────────┐
                                ↓
                         ┌─────────────┐
                         │     n8n     │
                         │ Automation  │
                         └──────┬──────┘
                                │
              ┌─────────────────┼─────────────────┐
              ↓                 ↓                 ↓
             IA               Gmail            Telegram
              │                                   │
              ↓                                   ↓
       Clasificación                         Notificaciones
       Prioridad
       Resumen
       Solución
```

---

# 9. Tecnologías

## Frontend

Yo utilizaría:

```text
React
TypeScript
Tailwind CSS
Vite
```

### ¿Por qué React?

Porque te permite construir una interfaz moderna y componentizada.

---

# 10. Firebase

Firebase será la infraestructura principal.

Utilizaremos:

### Firebase Authentication

Para:

```text
Registro
Login
Logout
Recuperación de contraseña
Google Login
```

---

### Cloud Firestore

Será nuestra base de datos.

Guardará:

```text
Usuarios
Tickets
Comentarios
Notificaciones
Categorías
Evaluaciones
Auditoría
Configuración
```

---

### Firebase Storage

Para:

```text
Capturas de pantalla
Imágenes
Documentos
Evidencias
```

---

### Firebase Hosting

Para publicar la aplicación.

Ejemplo:

```text
https://itflow.web.app
```

---

# 11. 🗄️ Estructura de Firestore

La estructura inicial sería:

```text
Firestore
│
├── users
│
├── tickets
│
├── comments
│
├── attachments
│
├── notifications
│
├── categories
│
├── evaluations
│
├── audit_logs
│
├── sla_configs
│
└── system_configs
```

---

# 12. Colección `users`

Ejemplo:

```text
users/{userId}
```

Campos:

```text
id
name
lastname
email
role
department
position
phone
photoURL
status
createdAt
updatedAt
```

Ejemplo:

```json
{
  "name": "Juan",
  "lastname": "Perez",
  "email": "juan@empresa.com",
  "role": "user",
  "department": "Marketing",
  "status": "active"
}
```

---

# 13. Colección `tickets`

Esta será la parte principal.

```text
tickets/{ticketId}
```

Campos:

```text
ticketNumber
title
description
category
subcategory
priority
status
userId
assignedTo
department
aiAnalysis
sla
createdAt
updatedAt
assignedAt
resolvedAt
closedAt
```

Ejemplo:

```json
{
  "ticketNumber": "IT-000125",
  "title": "No puedo conectarme a Internet",
  "description": "Desde esta mañana no tengo conexión.",
  "category": "network",
  "priority": "high",
  "status": "assigned",
  "userId": "user_123",
  "assignedTo": "tech_001"
}
```

---

# 14. Estados de los tickets

El flujo principal será:

```text
NEW
 ↓
ANALYZING
 ↓
PENDING
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
RESOLVED
 ↓
CLOSED
```

También:

```text
WAITING_USER
ESCALATED
CANCELLED
```

Visualmente:

```text
🆕 Nuevo
   ↓
🤖 Analizando
   ↓
⏳ Pendiente
   ↓
👨‍💻 Asignado
   ↓
🔧 En progreso
   ↓
✅ Resuelto
   ↓
🔒 Cerrado
```

---

# 15. Categorías

Inicialmente podríamos tener:

```text
Hardware
Software
Red
Accesos
Correo
Seguridad
Impresoras
Sistemas
Otros
```

Y subcategorías:

```text
Hardware
├── Laptop
├── PC
├── Monitor
├── Teclado
└── Mouse

Red
├── Internet
├── WiFi
├── VPN
└── Servidor

Accesos
├── Correo
├── Sistema
├── Cuenta
└── Permisos
```

---

# 16. Prioridades

Tendremos:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Por ejemplo:

### Baja

Problema que no impide trabajar.

### Media

Afecta parcialmente al usuario.

### Alta

Impide realizar una tarea importante.

### Crítica

Problema que afecta a varios usuarios o un servicio crítico.

---

# 17. 🤖 Sistema de IA

La IA no tendrá control absoluto.

Será un **asistente de soporte**.

Cuando llega un ticket:

```text
Descripción
     ↓
    n8n
     ↓
     IA
     ↓
JSON estructurado
```

La IA devolverá:

```json
{
  "category": "network",
  "subcategory": "wifi",
  "priority": "high",
  "summary": "Usuario sin conexión WiFi",
  "problem_type": "connectivity",
  "suggested_solution": "Verificar adaptador y conectividad"
}
```

n8n validará esa respuesta.

---

# 18. 🔄 Flujo completo de creación de ticket

Este será uno de los procesos más importantes.

```text
USUARIO
   │
   ↓
Inicia sesión
   │
   ↓
Crear incidencia
   │
   ↓
Introduce título
   │
   ↓
Introduce descripción
   │
   ↓
Adjunta evidencia
   │
   ↓
Enviar
   │
   ↓
Firebase
   │
   ↓
Crear ticket
   │
   ↓
n8n
   │
   ↓
IA
   │
   ├── Categoría
   ├── Prioridad
   ├── Resumen
   └── Solución sugerida
   │
   ↓
Actualizar Firebase
   │
   ↓
¿Prioridad alta?
   │
 ┌─┴─────────┐
NO           SÍ
 │            │
 ↓            ↓
Guardar     Notificar
 │           técnico
 └────┬───────┘
      ↓
Dashboard
```

---

# 19. ⚙️ Workflows de n8n

No tendremos un solo workflow.

Tendremos varios.

---

## Workflow 01 — Nuevo ticket

```text
Webhook
   ↓
Validar datos
   ↓
Consultar ticket
   ↓
Enviar descripción a IA
   ↓
Obtener clasificación
   ↓
Validar respuesta
   ↓
Actualizar Firestore
   ↓
Crear notificación
```

---

# 20. Workflow 02 — Notificación de ticket

```text
Ticket actualizado
       ↓
¿Debe notificarse?
       ↓
      Sí
       ↓
¿A quién?
       ↓
Técnico
       ↓
Enviar mensaje
```

Podremos utilizar:

```text
Gmail
Telegram
Discord
```

---

# 21. Workflow 03 — Ticket crítico

```text
Ticket
 ↓
Priority = CRITICAL
 ↓
n8n
 ↓
Notificar técnico
 ↓
Notificar administrador
 ↓
Registrar auditoría
```

---

# 22. Workflow 04 — SLA

Este será bastante interesante.

Supongamos:

```text
Critical → 1 hora
High     → 2 horas
Medium   → 8 horas
Low      → 24 horas
```

n8n ejecutará periódicamente:

```text
Cada 15 minutos
       ↓
Buscar tickets abiertos
       ↓
Calcular tiempo
       ↓
¿SLA próximo a vencer?
       ↓
      Sí
       ↓
Enviar alerta
```

---

# 23. Workflow 05 — SLA vencido

```text
Ticket
 ↓
SLA vencido
 ↓
Cambiar estado
 ↓
Registrar incumplimiento
 ↓
Notificar administrador
 ↓
Escalar ticket
```

---

# 24. Workflow 06 — Ticket resuelto

Cuando el técnico resuelve:

```text
IN_PROGRESS
      ↓
RESOLVED
      ↓
Notificar usuario
```

El usuario recibe:

> Tu incidencia IT-000125 fue marcada como resuelta.

---

# 25. Workflow 07 — Cierre

El usuario confirma:

```text
¿El problema fue solucionado?

[ Sí ]
[ No ]
```

### Sí

```text
RESOLVED
 ↓
CLOSED
 ↓
Encuesta
```

### No

```text
RESOLVED
 ↓
REOPENED
 ↓
Técnico
```

---

# 26. Workflow 08 — Encuesta

Después del cierre:

```text
Ticket cerrado
      ↓
Enviar encuesta
      ↓
Usuario califica
      ↓
Guardar evaluación
```

Datos:

```text
rating
comment
ticketId
userId
createdAt
```

---

# 27. Workflow 09 — Reporte semanal

n8n puede ejecutar:

```text
Cada viernes
     ↓
Consultar tickets
     ↓
Calcular estadísticas
     ↓
Generar reporte
     ↓
Enviar administrador
```

Ejemplo:

```text
Reporte semanal

Tickets recibidos: 84
Resueltos: 78
Pendientes: 6

SLA cumplido: 94%

Categoría principal:
Red

Tiempo promedio:
2h 14min

Satisfacción:
4.6/5
```

---

# 28. 📊 Dashboard del usuario

El usuario verá:

```text
Mis incidencias

Total       15
Abiertas     3
Resueltas   12
```

Listado:

```text
IT-000125
Problema de Internet
🔴 Alta
En progreso

IT-000124
Problema de impresora
🟡 Media
Resuelto
```

---

# 29. 👨‍💻 Dashboard del técnico

El técnico tendrá:

```text
Mis tickets

Nuevos             8
En progreso        5
Pendientes         3
Resueltos         42
```

Filtros:

```text
Prioridad
Categoría
Estado
Fecha
Usuario
```

---

# 30. 👨‍💼 Dashboard administrativo

Tendrá:

```text
Total tickets              358
Abiertos                    42
Resueltos                  316
Críticos                     8
```

Además:

### Gráfico de tickets por día

```text
Lun ███████
Mar █████████
Mié █████
Jue ███████████
Vie ████████
```

### Por categoría

```text
Red             35%
Software        27%
Hardware        19%
Accesos         12%
Otros            7%
```

### Por técnico

```text
Carlos     82
Pedro      67
Maria      54
Luis       43
```

---

# 31. 🎫 Pantalla de detalle de ticket

Esta será una de las pantallas más importantes.

```text
┌──────────────────────────────────────────┐
│ IT-000125                     🔴 Alta     │
│                                          │
│ No puedo conectarme a Internet           │
│                                          │
│ Usuario: Juan Pérez                      │
│ Categoría: Red                           │
│ Técnico: Carlos                          │
│ Estado: En progreso                      │
│                                          │
├──────────────────────────────────────────┤
│ DESCRIPCIÓN                              │
│                                          │
│ Desde esta mañana no tengo Internet...   │
│                                          │
├──────────────────────────────────────────┤
│ 🤖 ANÁLISIS DE IA                        │
│                                          │
│ Categoría: Red                           │
│ Prioridad: Alta                          │
│                                          │
│ Solución sugerida:                       │
│ Verificar adaptador WiFi...              │
│                                          │
├──────────────────────────────────────────┤
│ HISTORIAL                                │
│                                          │
│ 👤 Ticket creado                         │
│ 🤖 Analizado                             │
│ 👨‍💻 Asignado                              │
│                                          │
├──────────────────────────────────────────┤
│ Comentario                               │
│ [_______________________________]        │
│                                          │
│ [Enviar comentario]                      │
└──────────────────────────────────────────┘
```

---

# 32. 📎 Sistema de archivos

Cuando el usuario adjunte:

```text
captura_error.png
```

El flujo será:

```text
Usuario
 ↓
React
 ↓
Firebase Storage
 ↓
URL
 ↓
Ticket
```

El ticket guardará la referencia.

---

# 33. 🔐 Seguridad

Esta parte será fundamental.

Firebase Authentication identifica al usuario.

Firestore Security Rules determinará qué puede hacer.

Ejemplo conceptual:

```text
Usuario
→ puede leer sus tickets

Técnico
→ puede leer tickets asignados

Administrador
→ puede leer todos
```

Además:

* validación de datos;
* control de roles;
* protección de archivos;
* control de acceso;
* auditoría;
* variables de entorno.

---

# 34. 📋 Auditoría

Cada acción importante generará un registro.

Ejemplo:

```text
audit_logs

Usuario:
Carlos

Acción:
UPDATE_TICKET

Ticket:
IT-000125

Antes:
PENDING

Después:
IN_PROGRESS

Fecha:
11/08/2026 10:45
```

Esto permite saber:

> quién hizo qué y cuándo.

---

# 35. 📱 Diseño responsive

No quiero que sea solamente para computadora.

Debe funcionar en:

```text
Desktop
Laptop
Tablet
Mobile
```

Por ejemplo:

```text
Desktop
┌──────┬───────────────────┐
│ Menu │ Dashboard         │
│      │                   │
└──────┴───────────────────┘
```

En móvil:

```text
┌─────────────────────┐
│ ITFlow        ☰     │
├─────────────────────┤
│ Tickets             │
│                     │
│ #125   🔴           │
│ #124   🟡           │
│ #123   🟢           │
└─────────────────────┘
```

---

# 36. 📁 Arquitectura del código

El frontend podría quedar:

```text
itflow/
│
├── src/
│
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── tickets/
│   │   ├── dashboard/
│   │   └── notifications/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── user/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MyTickets.tsx
│   │   │   ├── CreateTicket.tsx
│   │   │   └── TicketDetail.tsx
│   │   │
│   │   ├── technician/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tickets.tsx
│   │   │   └── TicketDetail.tsx
│   │   │
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Users.tsx
│   │       ├── Reports.tsx
│   │       ├── Categories.tsx
│   │       └── AuditLogs.tsx
│   │
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── tickets.ts
│   │   ├── users.ts
│   │   ├── storage.ts
│   │   └── notifications.ts
│   │
│   ├── hooks/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   │
│   ├── types/
│   │   ├── User.ts
│   │   ├── Ticket.ts
│   │   └── Notification.ts
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 37. 📂 Estructura completa del repositorio

En GitHub:

```text
ITFlow/
│
├── frontend/
│
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── storage.rules
│
├── n8n/
│   ├── workflows/
│   │   ├── 01-new-ticket.json
│   │   ├── 02-ticket-classification.json
│   │   ├── 03-notification.json
│   │   ├── 04-critical-ticket.json
│   │   ├── 05-sla-monitor.json
│   │   ├── 06-ticket-resolved.json
│   │   ├── 07-ticket-closed.json
│   │   └── 08-weekly-report.json
│   │
│   └── README.md
│
├── docs/
│   ├── architecture/
│   │   ├── architecture.md
│   │   └── architecture.png
│   │
│   ├── database/
│   │   └── firestore.md
│   │
│   ├── workflows/
│   │   └── n8n-workflows.md
│   │
│   └── api/
│
├── screenshots/
│
├── .gitignore
├── .env.example
├── LICENSE
└── README.md
```

---

# 38. 🔗 Comunicación entre componentes

Hay que entender esto muy bien.

### React → Firebase

Para:

```text
Login
Usuarios
Tickets
Comentarios
Archivos
```

### Firebase → n8n

Para activar automatizaciones.

Dependiendo del diseño final podemos utilizar **webhooks, Cloud Functions/Eventarc o una capa intermedia**; no debemos asumir que Firestore puede simplemente "llamar" cualquier webhook directamente sin configurar ese puente.

### n8n → IA

Para:

```text
Clasificación
Prioridad
Resumen
Solución sugerida
```

### n8n → servicios externos

```text
Gmail
Telegram
Discord
```

### n8n → Firebase

Para actualizar:

```text
Categoría
Prioridad
Estado
Notificaciones
Logs
```

---

# 39. 🌐 Arquitectura de producción

Cuando esté terminado:

```text
                           INTERNET
                               │
                               ↓
                     ┌──────────────────┐
                     │ Firebase Hosting │
                     │                  │
                     │     ITFlow       │
                     └────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
        ┌─────────────────┐       ┌─────────────────┐
        │ Firebase Cloud  │       │ n8n Self-hosted │
        │                 │       │                 │
        │ Authentication  │       │ Workflows       │
        │ Firestore       │       │ Webhooks        │
        │ Storage         │       │ Credentials     │
        └─────────────────┘       └────────┬────────┘
                                           │
                         ┌─────────────────┼───────────────┐
                         ↓                 ↓               ↓
                        IA               Gmail          Telegram
```

---

# 40. ☁️ ¿Dónde estará cada cosa?

| Componente     | Ubicación                 |
| -------------- | ------------------------- |
| Código         | GitHub                    |
| Frontend       | Firebase Hosting          |
| Usuarios       | Firebase Auth             |
| Base de datos  | Firestore                 |
| Archivos       | Firebase Storage          |
| Automatización | n8n                       |
| IA             | API del proveedor elegido |
| Notificaciones | Gmail/Telegram/Discord    |
| Documentación  | GitHub                    |

---

# 41. 💰 Arquitectura gratuita

Durante el desarrollo:

```text
React
   ↓
Firebase
   ↓
n8n local
```

Después:

```text
React
   ↓
Firebase Hosting
   ↓
Firebase Cloud
   ↓
n8n self-hosted
```

La clave es que **no vamos a depender de n8n para las funciones básicas de ITFlow**.

Si n8n está temporalmente fuera de servicio:

```text
Crear ticket
Consultar ticket
Comentar
Cerrar
Ver dashboard
```

deben seguir funcionando.

Lo que podría quedar temporalmente pendiente serían:

```text
Clasificación IA
Notificaciones automáticas
SLA automático
Reportes automáticos
```

Eso es una arquitectura mucho más sólida.

---

# 42. 🔄 Ejemplo completo de principio a fin

Supongamos:

> Juan no puede acceder al sistema de ventas.

### Paso 1

Juan inicia sesión.

```text
Firebase Auth
```

### Paso 2

Crea:

```text
Título:
No puedo acceder al sistema de ventas

Descripción:
Desde las 10:00 no puedo iniciar sesión.
```

### Paso 3

Firebase crea:

```text
IT-000201
```

Estado:

```text
NEW
```

### Paso 4

Se activa n8n.

```text
NEW
 ↓
n8n
```

### Paso 5

IA analiza:

```text
Categoría: Accesos
Prioridad: Alta
```

### Paso 6

n8n actualiza Firebase:

```text
category = access
priority = high
status = pending
```

### Paso 7

n8n identifica al técnico correspondiente.

```text
Área: Sistemas
Técnico: Carlos
```

### Paso 8

Envía:

```text
🔴 Nuevo ticket de alta prioridad

IT-000201
No puedo acceder al sistema de ventas.
```

### Paso 9

Carlos entra.

```text
ASIGNADO
```

### Paso 10

Carlos empieza:

```text
EN PROGRESO
```

### Paso 11

Carlos encuentra el problema.

Agrega:

> Se restablecieron las credenciales del usuario.

### Paso 12

Marca:

```text
RESUELTO
```

### Paso 13

Juan recibe:

> Tu incidencia ha sido resuelta.

### Paso 14

Juan confirma:

```text
Sí, problema solucionado.
```

### Paso 15

Ticket:

```text
CERRADO
```

### Paso 16

Se muestra:

```text
⭐ ⭐ ⭐ ⭐ ⭐
¿Cómo fue la atención?
```

### Paso 17

Se guarda la evaluación.

### Paso 18

El dashboard se actualiza:

```text
Tickets resueltos +1
Satisfacción actualizada
Tiempo de resolución actualizado
```

Ese es el **ciclo completo de ITFlow**.

---

# 43. 📈 Evolución del proyecto

No debemos desarrollar todo al mismo tiempo.

## Fase 1 — Base

```text
React
Firebase
Authentication
Firestore
```

Resultado:

> Usuarios pueden registrarse e iniciar sesión.

---

## Fase 2 — Tickets

```text
Crear
Listar
Consultar
Actualizar
Cerrar
```

Resultado:

> Ya tenemos un sistema de tickets funcional.

---

## Fase 3 — Roles

```text
Usuario
Técnico
Administrador
```

Resultado:

> Cada persona ve las funciones correspondientes.

---

## Fase 4 — Storage

```text
Imágenes
Evidencias
Documentos
```

---

## Fase 5 — n8n

Primero una automatización sencilla:

```text
Ticket creado
 ↓
n8n
 ↓
Notificación
```

---

## Fase 6 — IA

```text
Ticket
 ↓
n8n
 ↓
IA
 ↓
Clasificación
 ↓
Firebase
```

---

## Fase 7 — SLA

```text
Tiempo
 ↓
n8n
 ↓
Alertas
 ↓
Escalamiento
```

---

## Fase 8 — Dashboard

```text
KPIs
Gráficos
Reportes
```

---

## Fase 9 — Auditoría y seguridad

```text
Roles
Rules
Logs
Permisos
```

---

## Fase 10 — Producción

```text
GitHub
   ↓
Firebase Hosting
   ↓
n8n online
   ↓
🌎 ITFlow
```

---

# 44. 📌 MVP que realmente debemos terminar primero

Aunque el proyecto completo tenga muchas funcionalidades, la **primera versión funcional** será:

```text
                 ITFlow MVP

                     │
          ┌──────────┴──────────┐
          ↓                     ↓
       Usuario               Técnico
          │                     │
          ↓                     ↓
      Crear ticket         Ver tickets
          │                     │
          ↓                     ↓
       Firestore           Actualizar
          │                     │
          └──────────┬──────────┘
                     ↓
                   n8n
                     ↓
                    IA
                     ↓
               Clasificación
                     ↓
                  Firebase
                     ↓
                Notificación
```

Después construimos las características avanzadas.

---

# 45. 🎯 Resultado final que queremos conseguir

Al terminar, tendrás:

### Una aplicación web real

```text
🌐 ITFlow
```

### Un sistema de autenticación

```text
Firebase Auth
```

### Una base de datos real

```text
Firestore
```

### Almacenamiento de archivos

```text
Firebase Storage
```

### Automatizaciones

```text
n8n
```

### Inteligencia artificial

```text
Clasificación
Prioridad
Resumen
Sugerencias
```

### Notificaciones

```text
Email
Telegram
Discord
```

### Dashboard

```text
KPIs
Gráficos
SLA
Rendimiento
```

### Seguridad

```text
Roles
Permisos
Rules
Auditoría
```

### Repositorio profesional

```text
GitHub
├── Código
├── Workflows
├── Documentación
├── Arquitectura
├── Capturas
└── README
```

---

## 🧠 La arquitectura que debemos tener siempre en mente

```text
                              ┌───────────────┐
                              │    USUARIO    │
                              └───────┬───────┘
                                      │
                                      ↓
                            ┌──────────────────┐
                            │    ITFlow Web    │
                            │ React + TS       │
                            └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ↓                ↓                ↓
             Firebase Auth      Firestore          Storage
                    │                │                │
                    │                │                │
                    │                └──────┬─────────┘
                    │                       │
                    │                       ↓
                    │                    Tickets
                    │                       │
                    │                       ↓
                    │                      n8n
                    │                       │
                    │          ┌────────────┼────────────┐
                    │          ↓            ↓            ↓
                    │         IA         Gmail       Telegram
                    │          │
                    │          ↓
                    │    Clasificación
                    │    Prioridad
                    │    Resumen
                    │    Solución
                    │
                    ↓
                 Roles
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
       Usuario   Técnico   Admin
```

**Esta es la estructura que yo tomaría como arquitectura oficial de ITFlow.** A partir de aquí, ya no conviene agregar tecnologías porque sí: cada componente tiene una función concreta.

Y para construirlo de verdad, el siguiente documento que necesitamos hacer es el **diseño técnico de Firestore + diagrama de entidades + rutas/pantallas + permisos de cada rol + especificación exacta de los workflows de n8n**. Eso será nuestra guía antes de escribir la primera línea de código.
