import React, { useState, useEffect, useCallback } from 'react';
import { Card, Text, Heading, Flex, Button, Loading, ErrorState, EmptyState } from '../../design-system/index.js';
import { ChevronLeft, DollarSign, TrendingUp, Award, Calendar, BarChart3 } from 'lucide-react';
import EarningsCard from '../components/EarningsCard.jsx';
import { driverAPI } from '../driver-api.js';

export default function EarningsPage({ onBack }) {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState('today');

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [td, wk, mo] = await Promise.all([
        driverAPI.todayEarnings(),
        driverAPI.weeklyEarnings(),
        driverAPI.monthlyEarnings(),
      ]);
      setToday(td); setWeekly(wk); setMonthly(mo);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = period === 'today' ? today : period === 'weekly' ? weekly : monthly;
  const periods = [
    { id: 'today', label: 'Hari Ini' },
    { id: 'weekly', label: 'Minggu Ini' },
    { id: 'monthly', label: 'Bulan Ini' },
  ];

  if (error && !current) {
    return (
      <div className="drv-page">
        <header className="drv-page-header">
          <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Pendapatan</h2>
        </header>
        <ErrorState title="Gagal memuat" description="Tidak dapat memuat data pendapatan." onRetry={load} />
      </div>
    );
  }

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Pendapatan</h2>
      </header>

      <div className="drv-page-body">
        <Flex gap={8} style={{ marginBottom: 16 }}>
          {periods.map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </Flex>

        {loading ? (
          <Loading />
        ) : current ? (
          <>
            <EarningsCard
              total={current.total}
              trips={current.trips}
              bonus={current.bonus}
              label={periods.find((p) => p.id === period)?.label}
            />

            <Card>
              <Heading size="xs" style={{ marginBottom: 12 }}>Ringkasan</Heading>
              <Flex style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <Text size="sm">Total Pendapatan</Text>
                <Text size="sm" weight="bold">Rp {(current.total || 0).toLocaleString('id-ID')}</Text>
              </Flex>
              <Flex style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <Text size="sm">Jumlah Trip</Text>
                <Text size="sm">{current.trips || 0} trip</Text>
              </Flex>
              {current.cash > 0 && (
                <Flex style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text size="sm">Pembayaran Tunai</Text>
                  <Text size="sm">Rp {(current.cash || 0).toLocaleString('id-ID')}</Text>
                </Flex>
              )}
              {current.bonus > 0 && (
                <Flex style={{ justifyContent: 'space-between' }}>
                  <Text size="sm">Bonus & Insentif</Text>
                  <Text size="sm" color="success">+Rp {(current.bonus || 0).toLocaleString('id-ID')}</Text>
                </Flex>
              )}
            </Card>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Card>
                <Flex gap={8} style={{ alignItems: 'center' }}>
                  <TrendingUp size={20} color="var(--ds-color-primary)" />
                  <div>
                    <Text size="xs" color="muted">Rata-rata/trip</Text>
                    <Text size="sm" weight="bold">
                      Rp {current.trips > 0 ? Math.round(current.total / current.trips).toLocaleString('id-ID') : '0'}
                    </Text>
                  </div>
                </Flex>
              </Card>
              <Card>
                <Flex gap={8} style={{ alignItems: 'center' }}>
                  <Award size={20} color="var(--ds-color-warning)" />
                  <div>
                    <Text size="xs" color="muted">Jam Aktif</Text>
                    <Text size="sm" weight="bold">{current.trips * 22} mnt</Text>
                  </div>
                </Flex>
              </Card>
            </div>
          </>
        ) : (
          <div style={{ padding: 40 }}>
            <EmptyState icon={BarChart3} title="Belum ada data" description="Data pendapatan akan muncul setelah Anda menyelesaikan perjalanan." />
          </div>
        )}
      </div>
    </div>
  );
}
