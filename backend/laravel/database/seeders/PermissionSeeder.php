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
            // driver-specific lifecycle/management
            ['code' => 'driver.view',        'name' => 'Lihat driver'],
            ['code' => 'driver.create',      'name' => 'Buat driver'],
            ['code' => 'driver.update',      'name' => 'Update driver'],
            ['code' => 'driver.delete',      'name' => 'Hapus driver'],
            ['code' => 'driver.approve',     'name' => 'Setujui driver'],
            ['code' => 'driver.reject',      'name' => 'Tolak driver'],
            ['code' => 'driver.suspend',     'name' => 'Suspend driver'],
            ['code' => 'driver.manage_documents', 'name' => 'Kelola dokumen driver'],
            // admin
            ['code' => 'user.manage',      'name' => 'Kelola user'],
            ['code' => 'order.view.all',   'name' => 'Lihat semua pesanan'],
            ['code' => 'payment.refund',   'name' => 'Refund pembayaran'],
            // dispatch
            ['code' => 'dispatch.view',    'name' => 'Lihat dispatch'],
            ['code' => 'dispatch.retry',   'name' => 'Retry dispatch'],
            ['code' => 'dispatch.manage',  'name' => 'Kelola dispatch'],
            ['code' => 'dispatch.history', 'name' => 'Lihat riwayat dispatch'],
            // trip
            ['code' => 'trip.view',        'name' => 'Lihat trip'],
            ['code' => 'trip.create',      'name' => 'Buat trip'],
            ['code' => 'trip.update',      'name' => 'Update trip'],
            ['code' => 'trip.cancel',      'name' => 'Batalkan trip'],
            ['code' => 'trip.complete',    'name' => 'Selesaikan trip'],
            ['code' => 'trip.manage',      'name' => 'Kelola trip'],
            // pricing
            ['code' => 'pricing.view',     'name' => 'Lihat pricing'],
            ['code' => 'pricing.calculate','name' => 'Hitung pricing'],
            ['code' => 'pricing.manage',   'name' => 'Kelola pricing'],
            ['code' => 'pricing.audit',    'name' => 'Audit pricing'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['code' => $p['code']], $p);
        }

        // Wire roles -> permissions so RBAC is functional end-to-end.
        $this->grant('customer', ['order.create', 'order.view.own']);
        $this->grant('driver',   ['driver.location', 'order.accept', 'order.view.own', 'driver.view']);
        $this->grant('admin',    ['user.manage', 'order.view.all', 'payment.refund', 'order.view.own', 'driver.view', 'driver.create', 'driver.update', 'driver.delete', 'driver.approve', 'driver.reject', 'driver.suspend', 'driver.manage_documents', 'dispatch.view', 'dispatch.retry', 'dispatch.manage', 'dispatch.history', 'pricing.view', 'pricing.calculate', 'pricing.manage', 'pricing.audit']);
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
