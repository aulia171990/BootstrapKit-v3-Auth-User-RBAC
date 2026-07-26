import React from 'react';
import { Avatar, Text, Heading, Flex, Box } from '../../design-system/index.js';
import { Bell } from 'lucide-react';

export default function DriverHeader({ driver, unread, onNotify, onProfile }) {
  if (!driver) return null;
  return (
    <Flex style={{ alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
      <div onClick={onProfile} style={{ cursor: 'pointer' }}>
        <Avatar size="lg" name={driver?.name} />
      </div>
      <Box>
        <Heading size="sm">{driver?.name || 'Driver'}</Heading>
        <Flex gap={4} style={{ alignItems: 'center', marginTop: 2 }}>
          <Text size="xs" color="muted">
            {driver.rating ? '★ ' + driver.rating.toFixed(1) : ''}
          </Text>
          {driver.driverCode && (
            <Text size="xs" color="muted" style={{ marginLeft: 8 }}>#{driver.driverCode}</Text>
          )}
          <Text size="xs" color="muted" style={{ marginLeft: 8 }}>{driver?.email}</Text>
        </Flex>
      </Box>
      <Box style={{ marginLeft: 'auto', position: 'relative', cursor: 'pointer' }} onClick={onNotify}>
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--ds-color-danger)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread > 99 ? '99+' : unread}</span>
        )}
      </Box>
    </Flex>
  );
}
