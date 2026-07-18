<?php

namespace App\Services\Analytics;

class AnalyticsService
{
    public function __construct(
        private KPIService $kpis,
        private ReportService $reports,
        private ExportService $exports,
        private AggregationService $aggregation,
    ) {}

    public function dashboard(array $context = []): array
    {
        return [
            'kpi' => $this->kpis->today($context['date'] ?? null),
            'reports' => [
                'trips' => $this->reports->trips($context['range'] ?? 'daily', $context['from'] ?? null, $context['to'] ?? null),
            ],
        ];
    }

    public function export(string $type, ?string $from, ?string $to)
    {
        return $this->exports->csv($type, $from, $to);
    }

    public function aggregate(?string $date = null): void
    {
        $this->aggregation->runDaily($date);
    }
}
