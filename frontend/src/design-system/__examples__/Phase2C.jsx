import React, { useState } from 'react';
import {
  Modal, Drawer, Sheet, Popover, Tooltip, Toast, Snackbar, Alert, Banner,
  Progress, Loading, LoadingOverlay, EmptyState, ErrorState, SuccessState, ConfirmationDialog,
} from '../index.js';
import { Button } from '../index.js';

/** Phase 2C — overlays / notifications / states usage examples (Storybook-style, no dep). */
export const OverlaysExample = () => {
  const [m, setM] = useState(false);
  const [d, setD] = useState(false);
  const [s, setS] = useState(false);
  const [c, setC] = useState(false);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <Button onClick={() => setM(true)}>Open Modal</Button>
      <Button onClick={() => setD(true)} variant="secondary">Open Drawer</Button>
      <Button onClick={() => setS(true)} variant="outline">Open Sheet</Button>
      <Button onClick={() => setC(true)} variant="destructive">Confirm</Button>
      <Modal open={m} onClose={() => setM(false)} title="Edit profile" onConfirm={() => setM(false)}>
        Modal body content.
      </Modal>
      <Drawer open={d} onClose={() => setD(false)} title="Filters" side="right">
        Drawer content.
      </Drawer>
      <Sheet open={s} onClose={() => setS(false)} title="Quick actions" side="bottom">
        Sheet content.
      </Sheet>
      <ConfirmationDialog open={c} onClose={() => setC(false)} onConfirm={() => setC(false)} title="Delete?" message="This cannot be undone." />
    </div>
  );
};

export const PopoverTooltip = (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Popover trigger="Menu"><div style={{ padding: 8 }}>Popover content</div></Popover>
    <Tooltip content="Tooltip text"><Button variant="ghost">Hover me</Button></Tooltip>
  </div>
);

export const Notifications = (
  <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
    <Alert tone="success" title="Saved" closable>Saved.</Alert>
    <Alert tone="warning">Check your input.</Alert>
    <Banner tone="info" title="Heads up">Maintenance tonight.</Banner>
    <Snackbar toasts={[{ id: '1', tone: 'success', title: 'Uploaded' }]} />
    <Toast tone="info" title="Note">Inline toast.</Toast>
  </div>
);

export const ProgressLoading = (
  <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    <Progress value={65} showLabel />
    <Loading label="Loading…" />
  </div>
);

export const States = (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <EmptyState title="No orders" description="Create one to get started." />
    <ErrorState title="Failed" description="Something went wrong." />
    <SuccessState title="Done" description="Operation complete." />
  </div>
);

export default { OverlaysExample, PopoverTooltip, Notifications, ProgressLoading, States };
