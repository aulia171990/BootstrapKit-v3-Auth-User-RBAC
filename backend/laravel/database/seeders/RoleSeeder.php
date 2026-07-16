<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'customer', 'description' => 'Pengguna yang memesan layanan'],
            ['name' => 'driver',   'description' => 'Pengemudi yang menerima order'],
            ['name' => 'admin',    'description' => 'Pengelola sistem'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        // Akun demo (password: password)
        $admin = User::firstOrCreate(
            ['email' => 'admin@ojol.test'],
            ['name' => 'Admin Demo', 'phone' => '6281000000001', 'password' => bcrypt('password'), 'status' => 1]
        );
        $admin->roles()->syncWithoutDetaching(Role::where('name', 'admin')->first()->id);
    }
}
