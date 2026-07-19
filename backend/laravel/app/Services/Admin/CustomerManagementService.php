<?php

namespace App\Services\Admin;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;

class CustomerManagementService
{
    public function __construct(private UserRepository $users) {}

    public function paginated(int $perPage = 20)
    {
        return $this->users->allForRole('customer', $perPage);
    }
}
