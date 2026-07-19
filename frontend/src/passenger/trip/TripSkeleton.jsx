import React from 'react';
import { Skeleton } from '../../design-system/index.js';

/**
 * TripSkeleton (3C-3I) — content-loading placeholder for the live trip
 * screens. Reuses the design-system Skeleton so the shimmer matches the rest of
 * the app. Used while the trip channel connects / driver data is pending.
 */
export default function TripSkeleton() {
  return (
    <div className="pasv-trip-skel" aria-hidden="true">
      <Skeleton variant="rect" height={300} radius="md" />
      <div className="pasv-trip-skel__card">
        <Skeleton variant="circle" width={56} height={56} />
        <div className="pasv-trip-skel__lines">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <div className="pasv-trip-skel__actions">
        <Skeleton variant="rect" height={44} radius="md" />
        <Skeleton variant="rect" height={44} radius="md" />
      </div>
      <Skeleton variant="rect" height={96} radius="md" />
    </div>
  );
}
