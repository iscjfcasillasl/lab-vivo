<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Pendiente - Laboratorio Vivo ITNN</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v={{ time() }}">
    <style>
        :root {
            --bg-dark: #0f172a;
            --primary: #10b981;
            --primary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --glass: rgba(255, 255, 255, 0.05);
            --border: rgba(255, 255, 255, 0.1);
        }
        body {
            background: var(--bg-dark);
            color: #fff;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .container {
            background: var(--glass);
            border: 1px solid var(--border);
            padding: 3rem;
            border-radius: 2rem;
            text-align: center;
            backdrop-filter: blur(20px);
            max-width: 500px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon-box {
            width: 80px;
            height: 80px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            color: var(--primary);
            font-size: 2.5rem;
        }
        h1 {
            font-weight: 700;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            letter-spacing: -0.025em;
        }
        p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .user-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.03);
            padding: 10px 16px;
            border-radius: 12px;
            margin-bottom: 2rem;
            justify-content: center;
        }
        .user-pill img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
        }
        .user-pill span {
            font-weight: 500;
            font-size: 0.9rem;
        }
        .btn-logout {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }
        .btn-logout:hover {
            color: #fff;
        }
        .status-badge {
            display: inline-block;
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon-box">
            <i class="ri-time-line"></i>
        </div>
        <div class="status-badge">Acceso Pendiente</div>
        <h1>Espera un momento, {{ explode(' ', $user->name)[0] }}</h1>
        <p>Tu cuenta ha sido registrada con éxito, pero requiere la aprobación de un administrador para acceder a la plataforma.</p>
        
        <div class="user-pill">
            @if($user->avatar)
                <img src="{{ $user->avatar }}" alt="avatar">
            @else
                <i class="ri-user-line"></i>
            @endif
            <span>{{ $user->email }}</span>
        </div>

        <a href="{{ route('logout') }}" class="btn-logout">
            <i class="ri-logout-box-line"></i> Cerrar Sesión
        </a>
    </div>
</body>
</html>
