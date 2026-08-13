# 🚀 ITFlow

Sistema Inteligente de Gestión y Automatización de Incidencias TI

## Resumen

Plataforma web para gestionar de manera centralizada las solicitudes e incidencias de soporte técnico. Permite a los usuarios registrar problemas, al equipo de soporte atenderlos, y a los administradores medir el rendimiento mediante IA, automatización y controles de SLA.

## 🌐 Aplicación en producción

Puedes acceder a la aplicación desde cualquier navegador:

**https://itflow-4a74b.web.app**

Para entrar necesitas una cuenta de usuario registrada en la aplicación. Si aún no tienes una, pídele a un administrador que cree tu cuenta o regístrate desde la propia página (si el registro está habilitado).

## Tecnologías

| Componente     | Tecnología                       |
| -------------- | -------------------------------- |
| Frontend       | React + TypeScript + Tailwind CSS + Vite |
| Usuarios       | Firebase Auth                    |
| Base de datos  | Firestore                        |
| Archivos       | Firebase Storage                 |
| Hosting        | Firebase Hosting                 |
| Automatización | Función serverless (Vercel)      |
| IA             | Google Gemini                    |
| Notificaciones | Gmail / Telegram / Discord       |

## Estructura del repositorio

```text
ITFlow/
│
├── frontend/          # Aplicación React
├── firebase/          # Reglas de Firestore y Storage, índices
├── functions/         # Cloud Function de Firebase (respaldo, no desplegada)
├── vercel-functions/  # Función serverless en producción (análisis IA)
├── n8n/               # Workflows de n8n (respaldo local)
├── docs/              # Documentación
└── screenshots/       # Capturas de pantalla
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
