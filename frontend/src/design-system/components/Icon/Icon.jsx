/* ============================================================
   Design System — Icon Component
   ------------------------------------------------------------
   Reusable wrapper around a Lucide icon.

   TREE-SHUAKING: pass the *named* Lucide component, never a
   string name registry. That keeps every unused icon out of
   the bundle (ESM named imports are statically analyzable):

     import { Home } from 'lucide-react';
     import { Icon } from '../design-system/components';

     <Icon icon={Home} size={20} tone="primary" />

   Features:
     - size  : number | 'xs'|'sm'|'md'|'lg'|'xl'  (default 'md'=20)
     - color : explicit CSS color (overrides tone)
     - tone  : semantic ds color (primary/success/danger/…)
     - strokeWidth + absoluteStrokeWidth
     - accessibility: decorative by default (aria-hidden);
       pass `label` to expose to screen readers (role=img +
       aria-label). Never both.
     - spin  : rotating animation w/ reduced-motion guard
   ============================================================ */

import React from 'react';
import './Icon.css';

const TONE_VAR = {
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  danger: 'var(--ds-color-danger)',
  info: 'var(--ds-color-info)',
  muted: 'var(--ds-color-text-muted)',
  inherit: 'currentColor',
};

const SIZE_PRESET = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };

export default function Icon({
  icon: IconComponent,
  size = 'md',
  color,
  tone = 'inherit',
  strokeWidth = 2,
  absoluteStrokeWidth = false,
  label,
  spin = false,
  className = '',
  style,
  ...rest
}) {
  if (!IconComponent) return null;

  const px = typeof size === 'number' ? size : (SIZE_PRESET[size] ?? SIZE_PRESET.md);
  const resolvedColor = color ?? TONE_VAR[tone] ?? TONE_VAR.inherit;

  const ariaProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true, focusable: false };

  return (
    <IconComponent
      size={px}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      className={['ds-icon', spin ? 'ds-icon--spin' : '', className].filter(Boolean).join(' ')}
      style={{ display: 'inline-flex', flexShrink: 0, ...style }}
      {...ariaProps}
      {...rest}
    />
  );
}
