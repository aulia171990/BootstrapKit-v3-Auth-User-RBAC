import React from 'react';
import { Card, Flex, Button, Text, StatusIndicator } from '../../design-system/index.js';

export default function OnlineToggle({ online, onToggle, zone, todayTrips }) {
  return (
    <Card style={{ background: online ? 'var(--ds-color-success-bg, #ecfdf5)' : 'var(--ds-color-surface)', border: online ? '1px solid var(--ds-color-success)' : undefined }}>
      <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Flex gap={8} style={{ alignItems: 'center' }}>
            <StatusIndicator tone={online ? 'success' : 'neutral'} pulse={online} />
            <Text size="sm" weight="bold">{online ? 'Online' : 'Offline'}</Text>
          </Flex>
          {zone && <Text size="xs" color="muted" style={{ marginTop: 2 }}>Zona: {zone}</Text>}
          {todayTrips > 0 && <Text size="xs" color="muted">{todayTrips} trip hari ini</Text>}
        </div>
        <Button
          variant={online ? 'danger' : 'success'}
          size="sm"
          onClick={onToggle}
        >
          {online ? 'Offline' : 'Online'}
        </Button>
      </Flex>
    </Card>
  );
}
