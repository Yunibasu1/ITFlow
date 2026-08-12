# 🚀 ITFlow

Sistema Inteligente de Gestión y Automatización de Incidencias TI

## Resumen

Plataforma web para gestionar de manera centralizada las solicitudes e incidencias de soporte técnico. Permite a los usuarios registrar problemas, al equipo de soporte atenderlos, y a los administradores medir el rendimiento mediante IA, automatización con n8n y controles de SLA.

## Tecnologías

| Componente     | Tecnología                       |
| -------------- | -------------------------------- |
| Frontend       | React + TypeScript + Tailwind CSS + Vite |
| Usuarios       | Firebase Auth                    |
| Base de datos  | Firestore                        |
| Archivos       | Firebase Storage                 |
| Hosting        | Firebase Hosting                 |
| Automatización | n8n                              |
| IA             | API del proveedor elegido        |
| Notificaciones | Gmail / Telegram / Discord       |

## Estructura del repositorio

```text
ITFlow/
│
├── frontend/      # Aplicación React
├── firebase/      # Reglas de Firestore y Storage, índices
├── n8n/           # Workflows de n8n
├── docs/          # Documentación
└── screenshots/   # Capturas de pantalla
```

## Configuración del entorno

1. Copia `frontend/.env.example` a `frontend/.env`.
2. Completa los valores con la configuración de tu proyecto de Firebase.
3. Instala dependencias:

```bash
cd frontend
npm install
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

## Documentación

- Plan maestro: `docs/plan-maestro.md`
- Diseño técnico: `docs/diseno-tecnico.md`
- Base de datos: `docs/firestore.md`
- Workflows n8n: `docs/n8n-workflows.md`

## Licencia

Ver archivo `LICENSE`.
