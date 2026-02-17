<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Laboratorio Vivo ITNN</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #0f172a;
            --primary: #10b981;
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
        }
        .login-card {
            background: var(--glass);
            border: 1px solid var(--border);
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            backdrop-filter: blur(10px);
            max-width: 400px;
            width: 100%;
        }
        .btn-google {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: #fff;
            color: #333;
            padding: 0.8rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            margin-top: 1.5rem;
            transition: transform 0.2s;
        }
        .btn-google:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="login-card">
        <i class="ri-leaf-line" style="font-size: 3rem; color: var(--primary);"></i>
        <h1>Laboratorio Vivo ITNN</h1>
        <p>Inicia sesión para acceder al Plan Maestro</p>
        <a href="{{ route('google.login') }}" class="btn-google">
            <i class="ri-google-fill"></i> Sign in with Google
        </a>
    </div>
</body>
</html>
