<?php

namespace Tests\Unit\Notification;

use App\Repositories\Notification\NotificationTemplateRepository;
use App\Services\Notification\NotificationTemplateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
    }

    public function test_template_service_creates_and_finds(): void
    {
        $service = new NotificationTemplateService(new NotificationTemplateRepository());
        $created = $service->create([
            'code' => 'TEST.TEMPLATE',
            'name' => 'Test Template',
            'locale' => 'id',
            'subject' => 'Hello',
            'body' => 'World',
            'channel' => 'in_app',
        ]);

        $this->assertNotNull($created->id);
        $this->assertNotNull($service->find('TEST.TEMPLATE'));
    }
}
