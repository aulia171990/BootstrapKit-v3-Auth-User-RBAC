<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestUserSeeder extends Seeder
{
    private const PASSWORD = 'Test1234!';

    public function run(): void
    {
        $customerRole = Role::where('name', 'customer')->first();
        $driverRole = Role::where('name', 'driver')->first();

        // ── Passengers ─────────────────────────────────────────
        $passengers = [
            ['name' => 'Budi Santoso',   'email' => 'budi@ojol.test',   'phone' => '6281111111111'],
            ['name' => 'Siti Rahayu',    'email' => 'siti@ojol.test',   'phone' => '6281111111112'],
            ['name' => 'Ahmad Fauzi',    'email' => 'ahmad@ojol.test',  'phone' => '6281111111113'],
        ];

        foreach ($passengers as $p) {
            $user = User::firstOrCreate(
                ['email' => $p['email']],
                [
                    'name' => $p['name'],
                    'phone' => $p['phone'],
                    'password' => bcrypt(self::PASSWORD),
                    'status' => User::STATUS_ACTIVE,
                    'email_verified' => true,
                    'phone_verified' => true,
                ]
            );
            $user->roles()->syncWithoutDetaching($customerRole->id);
        }

        // ── Drivers ────────────────────────────────────────────
        $drivers = [
            [
                'name' => 'Agus Wijaya',
                'email' => 'agus@ojol.test',
                'phone' => '6282222222221',
                'driver_code' => 'DRV-001',
                'license_plate' => 'B 1234 ABC',
                'vehicle_type' => 'motor',
                'rating' => 4.8,
                'completed_trips' => 342,
                'cancelled_trips' => 5,
                'acceptance_rate' => 97.5,
                'online_status' => Driver::STATUS_ONLINE,
                'latitude' => -6.2088,
                'longitude' => 106.8456,
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@ojol.test',
                'phone' => '6282222222222',
                'driver_code' => 'DRV-002',
                'license_plate' => 'B 5678 XYZ',
                'vehicle_type' => 'motor',
                'rating' => 4.9,
                'completed_trips' => 521,
                'cancelled_trips' => 2,
                'acceptance_rate' => 99.1,
                'online_status' => Driver::STATUS_ONLINE,
                'latitude' => -6.2146,
                'longitude' => 106.8306,
            ],
            [
                'name' => 'Rudi Hartono',
                'email' => 'rudi@ojol.test',
                'phone' => '6282222222223',
                'driver_code' => 'DRV-003',
                'license_plate' => 'B 9012 DEF',
                'vehicle_type' => 'car',
                'rating' => 4.6,
                'completed_trips' => 187,
                'cancelled_trips' => 8,
                'acceptance_rate' => 93.2,
                'online_status' => Driver::STATUS_BUSY,
                'latitude' => -6.1754,
                'longitude' => 106.8272,
            ],
        ];

        foreach ($drivers as $d) {
            $user = User::firstOrCreate(
                ['email' => $d['email']],
                [
                    'name' => $d['name'],
                    'phone' => $d['phone'],
                    'password' => bcrypt(self::PASSWORD),
                    'status' => User::STATUS_ACTIVE,
                    'email_verified' => true,
                    'phone_verified' => true,
                ]
            );
            $user->roles()->syncWithoutDetaching($driverRole->id);

            Driver::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'driver_code' => $d['driver_code'],
                    'license_plate' => $d['license_plate'],
                    'vehicle_type' => $d['vehicle_type'],
                    'status' => Driver::STATUS_APPROVED,
                    'verification_status' => 'verified',
                    'rating' => $d['rating'],
                    'completed_trips' => $d['completed_trips'],
                    'cancelled_trips' => $d['cancelled_trips'],
                    'acceptance_rate' => $d['acceptance_rate'],
                    'online_status' => $d['online_status'],
                    'latitude' => $d['latitude'],
                    'longitude' => $d['longitude'],
                ]
            );
        }

        $this->command->info('Test users seeded: ' . count($passengers) . ' passengers, ' . count($drivers) . ' drivers.');
    }
}
