<?php

namespace App\Exceptions\Auth;

final class AccountLockedException extends AuthException
{
    public function __construct($lockedUntil = null)
    {
        $this->errorMessage = 'Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi nanti.';
        parent::__construct();
    }
}
