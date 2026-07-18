<?php

namespace App\Exceptions\Auth;

final class InvalidCredentialsException extends AuthException
{
    protected string $errorMessage = 'Email atau password salah';
}
