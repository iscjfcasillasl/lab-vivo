<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if (!$user->approved && !$user->isSuperAdmin()) {
                return redirect()->route('pending-approval');
            }
            return redirect('/dashboard');
        }
        return view('login');
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user already exists
            $existingUser = User::where('email', $googleUser->email)->first();

            if ($existingUser) {
                // Update existing user info
                $existingUser->update([
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
                $user = $existingUser;
            } else {
                // New user — create as NOT approved (pending)
                $isSuperAdmin = $googleUser->email === User::SUPERADMIN_EMAIL;

                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => null,
                    'approved' => $isSuperAdmin, // Only auto-approve superadmin
                    'role' => $isSuperAdmin ? 'superadmin' : 'user',
                ]);
            }

            Auth::login($user);

            // Redirect based on approval status
            if (!$user->approved && !$user->isSuperAdmin()) {
                return redirect()->route('pending-approval');
            }

            return redirect('/dashboard');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Error de autenticación con Google: ' . $e->getMessage());
        }
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }

    /**
     * Show pending approval page
     */
    public function pendingApproval()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        if ($user->approved || $user->isSuperAdmin()) {
            return redirect('/dashboard');
        }
        return view('pending-approval', ['user' => $user]);
    }
}
