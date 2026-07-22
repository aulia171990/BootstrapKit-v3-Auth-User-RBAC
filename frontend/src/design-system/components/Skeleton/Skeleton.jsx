import React from 'react';
import { cx } from '../_util.js';
import './Skeleton.css';

function BaseSkeleton({ variant = 'rect', width, height, radius = 'sm', className, ...rest }) {
  return (
    <span
      className={cx('ds-skeleton', `ds-skeleton--${variant}`, className)}
      aria-hidden="true"
      style={{ width, height, borderRadius: variant === 'circle' ? '50%' : `var(--ds-radius-${radius})` }}
      {...rest}
    />
  );
}

export function PageSkeleton({ header = true, sidebar = false, lines = 6, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-page', className)} aria-hidden="true" {...rest}>
      {header && (
        <div className="ds-skeleton-page__header">
          <BaseSkeleton variant="rect" height={40} width="40%" radius="sm" />
          <BaseSkeleton variant="rect" height={32} width={32} radius="sm" />
        </div>
      )}
      <div className="ds-skeleton-page__body" style={{ display: 'flex', gap: 16 }}>
        {sidebar && (
          <div className="ds-skeleton-page__sidebar" style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <BaseSkeleton key={i} variant="rect" height={36} radius="sm" />
            ))}
          </div>
        )}
        <div className="ds-skeleton-page__content" style={{ flex: 1 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <BaseSkeleton key={i} variant="rect" height={16} radius="sm" style={{ width: i === lines - 1 ? '60%' : '100%', marginBottom: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ image = false, avatar = false, lines = 3, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-card', className)} aria-hidden="true" {...rest} style={{ border: '1px solid var(--ds-color-border)', borderRadius: 'var(--ds-radius-lg)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {image && <BaseSkeleton variant="rect" height={140} radius="md" />}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {avatar && <BaseSkeleton variant="circle" width={40} height={40} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <BaseSkeleton variant="rect" height={14} width="70%" radius="sm" />
          <BaseSkeleton variant="rect" height={10} width="40%" radius="sm" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <BaseSkeleton key={i} variant="rect" height={10} radius="sm" style={{ width: i === lines - 1 ? '50%' : '100%' }} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4, avatar = true, lines = 2, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-list', className)} aria-hidden="true" {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: i < count - 1 ? '1px solid var(--ds-color-border)' : 'none' }}>
          {avatar && <BaseSkeleton variant="circle" width={40} height={40} />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <BaseSkeleton variant="rect" height={13} width="60%" radius="sm" />
            {lines > 1 && <BaseSkeleton variant="rect" height={10} width="40%" radius="sm" />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-table', className)} aria-hidden="true" {...rest}>
      <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ds-color-border)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <BaseSkeleton key={i} variant="rect" height={12} radius="sm" style={{ flex: i === 0 ? 2 : 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < rows - 1 ? '1px solid var(--ds-color-border)' : 'none' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <BaseSkeleton key={j} variant="rect" height={10} radius="sm" style={{ flex: j === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AvatarSkeleton({ size = 40, className, ...rest }) {
  return <BaseSkeleton variant="circle" width={size} height={size} className={cx('ds-skeleton-avatar', className)} {...rest} />;
}

export function ImagePlaceholder({ width = '100%', height = 200, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-image', className)} aria-hidden="true" {...rest}
      style={{ width, height, background: 'var(--ds-color-surface-3)', borderRadius: 'var(--ds-radius-md)', display: 'grid', placeItems: 'center', color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
      <BaseSkeleton variant="rect" width="100%" height="100%" radius="md" />
    </div>
  );
}

export function FormFieldSkeleton({ labelWidth = '30%', inputHeight = 40, className, ...rest }) {
  return (
    <div className={cx('ds-skeleton-form', className)} aria-hidden="true" {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
      <BaseSkeleton variant="rect" height={12} width={labelWidth} radius="sm" />
      <BaseSkeleton variant="rect" height={inputHeight} radius="sm" />
    </div>
  );
}

export default function Skeleton({
  variant = 'rect',
  width,
  height,
  radius = 'sm',
  lines = 1,
  className,
  ...rest
}) {
  if (variant === 'page') return <PageSkeleton lines={lines} className={className} {...rest} />;
  if (variant === 'card') return <CardSkeleton lines={lines} className={className} {...rest} />;
  if (variant === 'list') return <ListSkeleton count={lines} className={className} {...rest} />;
  if (variant === 'table') return <TableSkeleton rows={lines} className={className} {...rest} />;
  if (variant === 'avatar') return <AvatarSkeleton size={width || 40} className={className} {...rest} />;
  if (variant === 'image') return <ImagePlaceholder width={width} height={height || 200} className={className} {...rest} />;
  if (variant === 'form') return <FormFieldSkeleton className={className} {...rest} />;

  if (variant === 'text' && lines > 1) {
    return (
      <span className={cx('ds-skeleton-wrap', className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="ds-skeleton ds-skeleton--text" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    );
  }
  return (
    <BaseSkeleton variant={variant} width={width} height={height} radius={radius} className={className} {...rest} />
  );
}
