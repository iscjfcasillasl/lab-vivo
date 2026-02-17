<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Laboratorio Vivo ITNN</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v={{ time() }}">
    <style>
        :root {
            --tecnm-blue: #1B396A;
            --tecnm-gold: #BC955C;
            --tecnm-white: #FFFFFF;
            --text-main: #1e293b;
            --text-muted: #64748b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: #f8fafc;
            height: 100vh;
            overflow: hidden;
        }

        .split-container {
            display: flex;
            height: 100vh;
            width: 100%;
        }

        /* LADO IZQUIERDO: PORTADA */
        .cover-side {
            flex: 1.2;
            position: relative;
            background: var(--tecnm-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .cover-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            /* Aquí va la imagen del edificio */
            background-image: url('{{ asset("img/building_itnn.png") }}');
            background-size: cover;
            background-position: center;
        }

        .cover-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(27, 57, 106, 0.9) 0%, rgba(27, 57, 106, 0.4) 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 4rem;
            color: white;
        }

        .cover-content h2 {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .cover-content p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 500px;
            font-weight: 300;
        }

        /* LADO DERECHO: LOGIN */
        .login-side {
            flex: 0.8;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
        }

        .login-box {
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .logo-container {
            margin-bottom: 2.5rem;
        }

        .logo-img {
            max-width: 180px;
            height: auto;
            /* Aplicar modo multiply para que el fondo blanco de la imagen desaparezca */
            mix-blend-mode: multiply;
        }

        .inst-title {
            color: var(--tecnm-blue);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .welcome-text {
            color: var(--text-muted);
            margin-bottom: 3rem;
            font-size: 1rem;
        }

        .btn-google {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: #f8fafc;
            color: #1e293b;
            padding: 1.2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .btn-google:hover {
            background: white;
            border-color: var(--tecnm-blue);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(27, 57, 106, 0.1);
        }

        .btn-google svg {
            width: 24px;
            height: 24px;
        }

        .footer-info {
            position: absolute;
            bottom: 2rem;
            left: 0;
            right: 0;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        .separator {
            display: flex;
            align-items: center;
            margin: 2rem 0;
            color: #cbd5e1;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .separator::before, .separator::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #e2e8f0;
        }

        .separator span {
            padding: 0 15px;
        }

        @media (max-width: 992px) {
            .cover-side { display: none; }
            .login-side { flex: 1; }
        }
    </style>
</head>
<body>
    <div class="split-container">
        <!-- Parte de la imagen institucional -->
        <div class="cover-side">
            <div class="cover-image"></div>
            <div class="cover-overlay">
                <div class="cover-content">
                    <h2>Laboratorio<br>Vivo ITNN</h2>
                    <p>Espacio de innovación, investigación y desarrollo tecnológico para el futuro de nuestra región.</p>
                </div>
            </div>
        </div>

        <!-- Parte del login -->
        <div class="login-side">
            <div class="login-box">
                <div class="logo-container">
                    <img src="{{ asset('img/logo_itnn.png') }}" alt="Logo ITNN" class="logo-img">
                </div>
                
                <h1 class="inst-title">Plan Maestro</h1>
                <p class="welcome-text">Inicia sesión con tu cuenta institucional para continuar.</p>

                <div class="separator"><span>Acceso Seguro</span></div>

                <a href="{{ route('google.login') }}" class="btn-google">
                    <svg viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Ingresar con Google
                </a>

                <div class="footer-info">
                    <strong>TecNM Campus Norte de Nayarit</strong><br>
                    Secretaría de Investigación y Posgrado
                </div>
            </div>
        </div>
    </div>
</body>
</html>
