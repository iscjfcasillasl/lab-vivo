<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Pendiente - Laboratorio Vivo ITNN</title>
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

        /* LADO DERECHO: CONTENT */
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
            margin-bottom: 2rem;
            font-size: 1rem;
            line-height: 1.6;
        }

        .btn-action {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: #f8fafc;
            color: #ef4444; /* Red for logout */
            padding: 1.2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            border: 1px solid #fee2e2;
            transition: all 0.3s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .btn-action:hover {
            background: #fef2f2;
            border-color: #ef4444;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.1);
        }

        .btn-action i {
            font-size: 1.2rem;
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

        .user-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 2rem;
            text-align: left;
        }

        .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .user-avatar-placeholder {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #e2e8f0;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .user-details h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 2px;
        }

        .user-details p {
            font-size: 0.85rem;
            color: var(--text-muted);
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

        <!-- Parte del contenido -->
        <div class="login-side">
            <div class="login-box">
                <div class="logo-container">
                    <img src="{{ asset('img/logo_itnn.png') }}" alt="Logo ITNN" class="logo-img">
                </div>
                
                <h1 class="inst-title">Espera un momento</h1>
                <p class="welcome-text">
                    Hola <strong>{{ explode(' ', $user->name)[0] }}</strong>,<br>
                    Tu cuenta ha sido registrada con éxito, pero requiere la aprobación de un administrador para acceder a la plataforma.
                </p>

                <div class="separator"><span>Estado: Pendiente</span></div>

                <div class="user-card">
                    @if($user->avatar)
                        <img src="{{ $user->avatar }}" alt="{{ $user->name }}" class="user-avatar" referrerpolicy="no-referrer">
                    @else
                        <div class="user-avatar-placeholder">
                            <i class="ri-user-line"></i>
                        </div>
                    @endif
                    <div class="user-details">
                        <h4>{{ $user->name }}</h4>
                        <p>{{ $user->email }}</p>
                    </div>
                </div>

                <a href="{{ route('logout') }}" class="btn-action">
                    <i class="ri-logout-box-line"></i>
                    Cerrar Sesión
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
