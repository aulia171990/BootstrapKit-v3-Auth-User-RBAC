<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // customer
            ['code' => 'order.create',     'name' => 'Buat pesanan'],
            ['code' => 'order.view.own',   'name' => 'Lihat pesanan sendiri'],
            // driver
            ['code' => 'driver.location',  'name' => 'Update lokasi driver'],
            ['code' => 'order.accept',     'name' => 'Terima pesanan'],
            // admin
            ['code' => 'user.manage',      'name' => 'Kelola user'],
            ['code' => 'order.view.all',   'name' => 'Lihat semua pesanan'],
            ['code' => 'payment.refund',   'name' => 'Refund pembayaran'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['code' => $p['code']], $p);
        }

        // Wire roles -> permissions so RBAC is functional end-to-end.
        $this->grant('customer', ['order.create', 'order.view.own']);
        $this->grant('driver',   ['driver.location', 'order.accept', 'order.view.own']);
        $this->grant('admin',    ['user.manage', 'order.view.all', 'payment.refund', 'order.view.own']);
    }

    private function grant(string $roleName, array $codes): void
    {
        $role = Role::where('name', $roleName)->first();
        if (! $role) {
            return;
        }
        foreach ($codes as $code) {
            $role->givePermission($code);
        }
    }
}
