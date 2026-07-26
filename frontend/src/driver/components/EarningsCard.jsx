import React from 'react';
import { Card, Text, Heading, Flex } from '../../design-system/index.js';
import { DollarSign, TrendingUp, Award } from 'lucide-react';

export default function EarningsCard({ total, trips, bonus, label, loading }) {
  if (loading) {
    return (
      <Card style={{ marginBottom: 12 }}>
        <Text size="xs" color="muted">{label || 'Pendapatan'}</Text>
        <Heading size="md">—</Heading>
      </Card>
    );
  }
  return (
    <Card style={{ marginBottom: 12 }}>
      <Flex style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text size="xs" color="muted">{label || 'Pendapatan'}</Text>
          <Heading size="md" style={{ marginTop: 4 }}>
            Rp {(total || 0).toLocaleString('id-ID')}
          </Heading>
          <Flex gap={16} style={{ marginTop: 8 }}>
            <Flex gap={4} style={{ alignItems: 'center' }}>
              <TrendingUp size={14} color="var(--ds-color-text-muted)" />
              <Text size="xs" color="muted">{trips || 0} trip</Text>
            </Flex>
            {bonus > 0 && (
              <Flex gap={4} style={{ alignItems: 'center' }}>
                <Award size={14} color="var(--ds-color-warning)" />
                <Text size="xs" color="muted">+Rp {bonus.toLocaleString('id-ID')}</Text>
              </Flex>
            )}
          </Flex>
        </div>
        <DollarSign size={24} color="var(--ds-color-success)" />
      </Flex>
    </Card>
  );
}
