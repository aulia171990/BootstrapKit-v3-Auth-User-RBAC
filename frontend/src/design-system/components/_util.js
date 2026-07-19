/* Shared helpers for design-system components. */

/** Join class names, dropping falsy values. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** Resolve a spacing scale key (1..24) to its --ds-space-* token. */
export function space(n) {
  if (n == null) return undefined;
  if (typeof n === 'number') return `var(--ds-space-${n})`;
  return String(n);
}

/** Resolve a tone to its semantic --ds-color-* variable. */
export const TONE_VAR = {
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  danger: 'var(--ds-color-danger)',
  info: 'var(--ds-color-info)',
  muted: 'var(--ds-color-text-muted)',
  inherit: 'currentColor',
};
