<?php

namespace App\Services\Analytics;

use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    public function csv(string $type, ?string $from, ?string $to): StreamedResponse
    {
        $filename = strtolower($type) . '_report_' . ($from ?? 'all') . '_' . ($to ?? 'all') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($type, $from, $to) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['type', 'metric', 'value']);

            $data = match ($type) {
                'trips' => (new ReportService())->trips('custom', $from, $to),
                default => ['message' => 'Unsupported export type'],
            };

            foreach ($data as $metric => $value) {
                fputcsv($handle, [$type, $metric, $value]);
            }

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
