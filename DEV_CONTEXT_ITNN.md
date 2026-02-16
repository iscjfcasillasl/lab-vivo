# Laboratorio Vivo ITNN - Dashboard (Versión Laravel)
**Documento de Contexto y Entrega de Desarrollo**
*Fecha: 16 de Febrero, 2026*

Este documento detalla la arquitectura técnica y el funcionamiento del **Dashboard de Ejecución del Laboratorio Vivo ITNN**, migrado a **Laravel 12**.

---

## 2. Regla Mandatoria de Sincronización
> **⚠️ CRÍTICO:** Cada vez que se realice una actualización, cambio de funcionalidad, o modificación en la estructura de datos de esta plataforma (Dashboard), **SE DEBE ACTUALIZAR SIMULTÁNEAMENTE EL ARCHIVO `Plan_Maestro_Integrado_ITNN.md`**.
>
> El Plan Maestro debe reflejar siempre el estado real y las capacidades técnicas actuales del sistema.

## 3. Stack Tecnológico
El proyecto ha evolucionado a una arquitectura robusta basada en MVC:

*   **Framework Backend:** Laravel 12 (PHP 8.2+).
*   **Base de Datos:** MySQL (con migraciones y Eloquent ORM).
*   **Frontend:** Blade Templates + Vanilla JS (ES6+) + CSS3 Variables.
*   **Autenticación:** Laravel Socialite (Google OAuth).
*   **Dependencias:** Composer para gestión de paquetes PHP.

---

## 4. Estructura de Archivos (Directorio `laravel_app`)

### Backend (`app/`)
*   **Models:**
    *   `Project.php`: Modelo principal. Relación `hasMany` con Activities.
    *   `Activity.php`: Modelo de tareas. Contiene la lógica de `priority` (critical, high, medium, low).
    *   `User.php`: Extendido con `google_id` y `avatar`.
*   **Controllers:**
    *   `DashboardController.php`: Gestiona la vista principal y la API (`GET/POST /api/projects`). Implementa transacciones para el guardado.
    *   `AuthController.php`: Gestiona el flujo de login con Google y logout.

### Frontend (`resources/` & `public/`)
*   **Views (`resources/views/`):**
    *   `dashboard.blade.php`: Vista principal (SPA) que carga el CSS/JS.
    *   `login.blade.php`: Pantalla de acceso.
*   **Assets (`public/`):**
    *   `js/app.js`: Lógica de cliente. Gestiona el Gantt, Modales y llamadas a la API (fetch con CSRF token).
    *   `css/style.css`: Estilos del tema Eco-Futurista.

---

## 5. Funcionalidades Implementadas

### A. Autenticación y Sesión
*   **Google Sign-In:** Integración nativa con cuentas de Google.
*   **Protección de Rutas:** El dashboard es inaccesible sin sesión activa.

### B. Gestión de Proyectos (Nuevo Modelo de Prioridad)
*   **Proyectos:** Contenedores de actividades. Ya no tienen prioridad intrínseca.
*   **Actividades:** Son las portadoras de la importancia (`Critical`, `High`, `Medium`, `Low`).
*   **Ordenamiento Automático:** La Vista Global ordena los proyectos basándose en la actividad más crítica que contengan.

### C. Visualización Gantt
*   **Vista Global:** Muestra el progreso de todos los proyectos.
*   **Vista Detalle:** Permite editar actividades, marcar checklist y visualizar tiempos.

---

## 6. Modelo de Datos (MySQL)

### Tabla `projects`
*   `id`, `name`, `description`, `color`, `icon`, `timestamps`.

### Tabla `activities`
*   `id`, `project_id` (FK), `text`, `days`, `done` (bool).
*   `priority`: ENUM('critical', 'high', 'medium', 'low'). **Campo Clave.**
*   `start_time`, `end_time`.

---

## 7. Instrucciones de Despliegue
Ver archivo `README.md` en la raíz para detalles de instalación (`composer install`, `php artisan migrate`, configuración `.env`).
