# Sistema Laboratorio Vivo ITNN (Laravel Version)

Este repositorio contiene la versión migrada del sistema a **Laravel 12**.

## 🚀 Instrucciones de Instalación

1.  **Navegar al directorio:**
    ```bash
    cd laravel_app
    ```

2.  **Instalar dependencias:**
    ```bash
    composer install
    ```

3. **Configurar Entorno:**
    - Copiar `.env.example` a `.env` (si no existe).
    - Generar clave de aplicación:
    ```bash
    php artisan key:generate
    ```
    - Configurar BD en `.env`.
    - Ejecutar migraciones:
    ```bash
    php artisan migrate
    ```

4.  **Configurar Google Login:**
    - En `.env`, colocar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
    - La URL de redirección autorizada debe ser: `http://localhost/proyecto-itnn/laravel_app/public/auth/google/callback`

5.  **Ejecutar:**
    - URL local: [http://localhost/proyecto-itnn/laravel_app/public](http://localhost/proyecto-itnn/laravel_app/public)

## ✨ Funcionalidades y Mejoras
- **Framework:** Laravel 12 + Blade + JavaScript Vanilla.
- **Autenticación:** Google OAuth (Socialite).
- **Gestión de Permisos:**
    - **Aprobación de Usuarios:** Los nuevos registros requieren aprobación del superadmin.
    - **Roles:** Superadmin vs Usuario normal.
    - **Propiedad:** Los usuarios solo pueden editar/borrar lo que ellos crearon.
- **Trazabilidad:** Historial completo de cambios con justificación obligatoria para cada avance.
- **Modelo de Datos:** 
    - La prioridad se asigna a las **Actividades**.
    - Los proyectos se ordenan automáticamente según la criticidad de sus tareas.
- **Persistencia:** Base de datos MySQL con soporte de transacciones y logs de actividad.
