# Sistema Laboratorio Vivo ITNN (Laravel Version)

Este repositorio contiene la versión migrada del sistema a **Laravel 12**.

## 📂 Estructura
- **laravel_app/**: Contiene el código fuente del nuevo sistema en Laravel and Vue/Blade.
- **_legacy_vanilla/**: Contiene la versión anterior en PHP/JS plano (backup).

## 🚀 Instrucciones de Instalación

1.  **Navegar al directorio:**
    ```bash
    cd laravel_app
    ```

2.  **Instalar dependencias (Si es necesario):**
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
    php artisan migrate:fresh
    ```

4.  **Configurar Google Login:**
    - En `.env`, colocar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
    - La URL de redirección autorizada debe ser: `http://localhost/proyecto-itnn/laravel_app/public/auth/google/callback`

5.  **Ejecutar:**
    - URL: [http://localhost/proyecto-itnn/laravel_app/public](http://localhost/proyecto-itnn/laravel_app/public)

## ✨ Cambios Clave
- **Framework:** Laravel 12 + Blade.
- **Autenticación:** Google OAuth (Socialite).
- **Modelo de Datos:** 
    - La prioridad ahora se asigna a las **Actividades**, no al Proyecto.
    - Los proyectos se ordenan automáticamente según la actividad más crítica que contengan.
- **Persistencia:** Base de datos MySQL con soporte de transacciones.
