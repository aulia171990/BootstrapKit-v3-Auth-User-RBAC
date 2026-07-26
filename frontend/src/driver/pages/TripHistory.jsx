import React, { useState, useEffect, useCallback } from 'react';
import { Loading, ErrorState, Button, Text, Flex, EmptyState, Skeleton } from '../../design-system/index.js';
import { Map, RefreshCw, ChevronLeft, ArrowDown } from 'lucide-react';
import TripCard from '../components/TripCard.jsx';
import { driverAPI } from '../driver-api.js';
import { usePullToRefresh } from '../../passenger/wallet/usePullToRefresh.js';

const PAGE_SIZE = 15;

export default function TripHistory({ onBack, onDetail }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true); setError(false);
    try {
      const data = await driverAPI.trips(`per_page=${PAGE_SIZE}&page=${pageNum}&sort=desc`);
      const list = Array.isArray(data) ? data : data?.data || [];
      setTrips(append ? (prev) => [...prev, ...list] : list);
      setHasMore(list.length >= PAGE_SIZE);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { containerRef, pullDistance, refreshing } = usePullToRefresh(load, { threshold: 64 });

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  if (error && trips.length === 0) {
    return (
      <div className="drv-page">
        <header className="drv-page-header">
          <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Riwayat Perjalanan</h2>
        </header>
        <ErrorState title="Gagal memuat" description="Tidak dapat memuat riwayat perjalanan." onRetry={() => load()} />
      </div>
    );
  }

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Riwayat Perjalanan</h2>
        <button className="drv-page-action" onClick={() => load()}><RefreshCw size={16} /></button>
      </header>

      <div className="drv-page-body" ref={containerRef}>
        {refreshing && (
          <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--ds-color-primary)' }}>
            <Loading size="sm" />
          </div>
        )}
        {pullDistance > 0 && !refreshing && (
          <div style={{
            textAlign: 'center', padding: '4px 0', transition: 'opacity 0.15s',
            opacity: Math.min(1, pullDistance / 48),
          }}>
            <ArrowDown size={16} style={{ transform: `rotate(${pullDistance > 32 ? 180 : 0}deg)`, transition: 'transform 0.2s' }} />
          </div>
        )}
        {loading && trips.length === 0 ? (
          <Skeleton variant="list" lines={5} />
        ) : trips.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState icon={Map} title="Belum ada perjalanan" description="Riwayat perjalanan akan muncul di sini." />
          </div>
        ) : (
          <>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onClick={() => onDetail?.(trip)} />
            ))}

            {loading && <Loading />}

            {hasMore && !loading && (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <Button variant="ghost" onClick={handleLoadMore}>Muat lebih banyak</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
