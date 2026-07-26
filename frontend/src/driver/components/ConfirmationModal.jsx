import React, { useState, useEffect } from 'react';
import { Card, Text, Flex, Button } from '../../design-system/index.js';
import { X } from 'lucide-react';

const ConfirmationModal = ({ title, message, onConfirm, onClose }) => {
  const [open, setOpen] = useState(true);
  useEffect(() => { if (!onClose) return; const handleKey = e => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [onClose]);

  if (!open) return null;
  return (
    <Card style={{ maxWidth: 400, margin: 'auto', padding: '24px', borderRadius: 8 }}>
      <Text size="lg" weight="bold">{title}</Text>
      <Text color="muted" style={{ marginBottom: 12 }}>{message}</Text>
      <Flex gap={8} style={{ justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={onConfirm} variant="danger">Ya, {title.toLowerCase()}</Button>
      </Flex>
    </Card>
  );
};

export default ConfirmationModal;