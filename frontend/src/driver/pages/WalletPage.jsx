import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Text, Heading, Flex, Loading, ErrorState, Skeleton, EmptyState } from '../../design-system/index.js';
import { ChevronLeft, Wallet, ArrowUp, ArrowDown, RefreshCw, History } from 'lucide-react';
import { driverAPI } from '../driver-api.js';

export default function WalletPage({ onBack, onHistory }) {
  const [balance, setBalance] = useState(null);
  const [transactions, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [bal, txs] = await Promise.all([
        driverAPI.walletBalance(),
        driverAPI.walletTransactions(10),
      ]);
      setBalance(bal?.balance ?? bal?.available_balance ?? bal);
      setTx(Array.isArray(txs) ? txs : []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const labelFor = (tx) => tx.title || tx.type || tx.description || 'Transaksi';
  const amountFor = (tx) => {
    const amt = Number(tx.amount || 0);
    const credit = ['topup', 'cashback', 'refund'].includes(tx.type);
    return { value: Math.abs(amt), inflow: credit || amt > 0 };
  };

  if (error && !balance) {
    return (
      <div className="drv-page">
        <header className="drv-page-header">
          <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Dompet</h2>
        </header>
        <ErrorState title="Gagal memuat" description="Tidak dapat memuat dompet." onRetry={load} />
      </div>
    );
  }

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Dompet</h2>
        <button className="drv-page-action" onClick={load}><RefreshCw size={16} /></button>
      </header>

      <div className="drv-page-body">
        <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, var(--ds-color-primary), #4338ca)', color: '#fff' }}>
          <Text size="xs" style={{ opacity: 0.8 }}>Saldo Tersedia</Text>
          <Heading size="lg" style={{ marginTop: 4 }}>
            {loading ? '...' : `Rp ${Number(balance || 0).toLocaleString('id-ID')}`}
          </Heading>
          <Flex gap={8} style={{ marginTop: 12 }}>
            <Button variant="light" size="sm"><ArrowUp size={14} style={{ marginRight: 4 }} />Top Up</Button>
            <Button variant="light" size="sm"><ArrowDown size={14} style={{ marginRight: 4 }} />Tarik</Button>
          </Flex>
        </Card>

        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Heading size="xs">Transaksi Terbaru</Heading>
          <Button variant="ghost" size="sm" onClick={onHistory}>
            <History size={14} style={{ marginRight: 4 }} />Riwayat
          </Button>
        </Flex>

        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={52} radius="md" style={{ marginBottom: 8 }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <EmptyState icon={Wallet} title="Belum ada transaksi" description="Transaksi akan muncul di sini." />
          </Card>
        ) : (
          transactions.map((tx) => {
            const { value, inflow } = amountFor(tx);
            return (
              <div key={tx.id || Math.random()} className="drv-tx-row" style={{ cursor: 'pointer' }} onClick={onHistory}>
                <div>
                  <Text size="sm">{labelFor(tx)}</Text>
                  <Text size="xs" color="muted">
                    {tx.at ? new Date(tx.at).toLocaleDateString('id-ID') : ''} · {tx.status}
                  </Text>
                </div>
                <Text size="sm" weight="bold" color={inflow ? 'success' : undefined}>
                  {inflow ? '+' : '-'}Rp {value.toLocaleString('id-ID')}
                </Text>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
