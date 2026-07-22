import React, { useEffect, useMemo, useState } from 'react';
import { Sheet } from '../../design-system/index.js';
import { Button, Icon, Badge, Skeleton, EmptyState } from '../../design-system/index.js';
import {
  CreditCard, Wallet, Banknote, Landmark, QrCode, Building2, Check, Tag, X, ChevronRight, Plus,
} from 'lucide-react';
import * as papi from '../api.js';
import './wallet.css';

const METHOD_ICON = {
  wallet: Wallet, card: CreditCard, cash: Banknote, bank: Landmark, qr: QrCode, va: Building2,
};

/**
 * PaymentVoucherSheet — bottom sheet untuk memilih metode pembayaran dan
 * voucher di perangkat mobile (syarat #4). Semua data diambil dari API:
 *   - metode  → getPaymentMethods()  (GET /api/v1/payment/methods)
 *   - voucher → getPromotions()      (GET /api/v1/promotions)
 *
 * Tidak ada saldo yang dihitung/di-cache di frontend — hanya daftar metode &
 * voucher dari backend. Pengguna memilih satu metode + (opsional) satu voucher,
 * lalu mengonfirmasi; pilihan diteruskan ke callback onConfirm.
 *
 * Props:
 *   open, onClose, amount (number, untuk konteks voucher minSpend),
 *   selectedMethodId, selectedVoucherId,
 *   onConfirm({ method, voucher }), onManageMethods, onViewVouchers
 */
export default function PaymentVoucherSheet({
  open,
  onClose,
  amount = 0,
  selectedMethodId,
  selectedVoucherId,
  onConfirm,
  onManageMethods,
  onViewVouchers,
}) {
  const [methods, setMethods] = useState(null);
  const [vouchers, setVouchers] = useState(null);
  const [methodId, setMethodId] = useState(selectedMethodId || null);
  const [voucherId, setVoucherId] = useState(selectedVoucherId || null);
  const [tab, setTab] = useState('method'); // method | voucher

  useEffect(() => {
    if (!open) return;
    setMethodId(selectedMethodId || null);
    setVoucherId(selectedVoucherId || null);
    let alive = true;
    Promise.all([papi.getPaymentMethods(), papi.getPromotions()])
      .then(([m, v]) => {
        if (!alive) return;
        setMethods(m || []);
        setVouchers(v || []);
        if (!selectedMethodId && m && m.length) setMethodId(m[0].id);
      })
      .catch(() => { if (alive) { setMethods([]); setVouchers([]); } });
    return () => { alive = false; };
  }, [open, selectedMethodId, selectedVoucherId]);

  const selectedMethod = useMemo(() => methods?.find((m) => m.id === methodId) || null, [methods, methodId]);
  const selectedVoucher = useMemo(() => vouchers?.find((v) => v.id === voucherId) || null, [vouchers, voucherId]);

  const eligibleVouchers = useMemo(() => {
    if (!vouchers) return [];
    return vouchers.filter((v) => {
      if (!v.eligible) return false;
      if (v.minSpend && amount && amount < v.minSpend) return false;
      return true;
    });
  }, [vouchers, amount]);

  const handleConfirm = () => {
    onConfirm?.({ method: selectedMethod, voucher: selectedVoucher });
  };

  const canConfirm = tab === 'method' ? !!selectedMethod : true;

  return (
    <Sheet open={open} onClose={onClose} side="bottom" title="" className="pasv-pvsheet">
      <div className="pasv-pvsheet__grab" aria-hidden />
      <header className="pasv-pvsheet__head">
        <h2 className="pasv-pvsheet__title">{tab === 'method' ? 'Pilih Metode Pembayaran' : 'Pilih Voucher'}</h2>
        <button type="button" className="pasv-pvsheet__close" aria-label="Tutup" onClick={onClose}>
          <Icon icon={X} size="sm" />
        </button>
      </header>

      <div className="pasv-pvsheet__tabs" role="tablist" aria-label="Pilih metode atau voucher">
        <button type="button" role="tab" aria-selected={tab === 'method'}
          className={`pasv-pvsheet__tab ${tab === 'method' ? 'is-active' : ''}`} onClick={() => setTab('method')}>
          <Icon icon={CreditCard} size="xs" /> Metode
        </button>
        <button type="button" role="tab" aria-selected={tab === 'voucher'}
          className={`pasv-pvsheet__tab ${tab === 'voucher' ? 'is-active' : ''}`} onClick={() => setTab('voucher')}>
          <Icon icon={Tag} size="xs" /> Voucher
          {vouchers && vouchers.length > 0 && <Badge tone="primary">{vouchers.length}</Badge>}
        </button>
      </div>

      <div className="pasv-pvsheet__body">
        {tab === 'method' && (
          <MethodList
            loading={methods === null}
            methods={methods}
            methodId={methodId}
            onSelect={setMethodId}
            onManage={onManageMethods}
          />
        )}
        {tab === 'voucher' && (
          <VoucherList
            loading={vouchers === null}
            vouchers={vouchers}
            eligibleVouchers={eligibleVouchers}
            voucherId={voucherId}
            onSelect={setVoucherId}
            onViewAll={onViewVouchers}
            amount={amount}
          />
        )}
      </div>

      <footer className="pasv-pvsheet__footer">
        {tab === 'method' ? (
          <>
            <Button variant="secondary" fullWidth onClick={() => setTab('voucher')}>
              Lanjut: Voucher
            </Button>
            <Button variant="primary" fullWidth disabled={!canConfirm} onClick={handleConfirm}>
              Konfirmasi Metode
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" fullWidth onClick={() => setTab('method')}>
              Kembali
            </Button>
            <Button variant="primary" fullWidth onClick={handleConfirm}>
              {selectedVoucher ? 'Gunakan Voucher' : 'Tanpa Voucher'}
            </Button>
          </>
        )}
      </footer>
    </Sheet>
  );
}

function MethodList({ loading, methods, methodId, onSelect, onManage }) {
  if (loading) {
    return (
      <div className="pasv-pvsheet__list">
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="rect" height={56} radius="md" />)}
      </div>
    );
  }
  if (!methods || methods.length === 0) {
    return <EmptyState icon={CreditCard} title="Belum ada metode" description="Tambahkan metode pembayaran terlebih dahulu." />;
  }
  return (
    <ul className="pasv-pvsheet__list" role="radiogroup" aria-label="Metode pembayaran">
      {methods.map((m) => {
        const Ico = METHOD_ICON[m.kind] || CreditCard;
        const active = m.id === methodId;
        return (
          <li key={m.id}>
            <button type="button" role="radio" aria-checked={active}
              className={`pasv-pvsheet__item ${active ? 'is-active' : ''}`} onClick={() => onSelect(m.id)}>
              <span className="pasv-pvsheet__item-ico"><Icon icon={Ico} size="sm" /></span>
              <span className="pasv-pvsheet__item-body">
                <span className="pasv-pvsheet__item-label">{m.label}</span>
                <span className="pasv-pvsheet__item-sub">{m.detail}</span>
              </span>
              {m.primary && <Badge tone="primary">Utama</Badge>}
              {active && <Icon icon={Check} size="sm" className="pasv-pvsheet__item-check" />}
            </button>
          </li>
        );
      })}
      <li>
        <button type="button" className="pasv-pvsheet__manage" onClick={onManage}>
          <Icon icon={Plus} size="sm" /> Kelola metode pembayaran
          <Icon icon={ChevronRight} size="xs" />
        </button>
      </li>
    </ul>
  );
}

function VoucherList({ loading, vouchers, eligibleVouchers, voucherId, onSelect, onViewAll, amount }) {
  if (loading) {
    return (
      <div className="pasv-pvsheet__list">
        {[0, 1].map((i) => <Skeleton key={i} variant="rect" height={64} radius="md" />)}
      </div>
    );
  }
  return (
    <div className="pasv-pvsheet__vouchers">
      <button type="button" className={`pasv-pvsheet__item ${!voucherId ? 'is-active' : ''}`}
        onClick={() => onSelect(null)} aria-pressed={!voucherId}>
        <span className="pasv-pvsheet__item-ico pasv-pvsheet__item-ico--none"><Icon icon={X} size="sm" /></span>
        <span className="pasv-pvsheet__item-body">
          <span className="pasv-pvsheet__item-label">Tanpa voucher</span>
          <span className="pasv-pvsheet__item-sub">Bayar harga penuh</span>
        </span>
        {!voucherId && <Icon icon={Check} size="sm" className="pasv-pvsheet__item-check" />}
      </button>

      {eligibleVouchers.length === 0 && (!vouchers || vouchers.length === 0) ? (
        <EmptyState icon={Tag} title="Tidak ada voucher" description="Belum ada voucher yang bisa digunakan." />
      ) : eligibleVouchers.length === 0 ? (
        <p className="pasv-pvsheet__empty">Tidak ada voucher yang memenuhi syarat untuk pembayaran ini.</p>
      ) : (
        <ul className="pasv-pvsheet__list" role="radiogroup" aria-label="Voucher">
          {eligibleVouchers.map((v) => {
            const active = v.id === voucherId;
            return (
              <li key={v.id}>
                <button type="button" role="radio" aria-checked={active}
                  className={`pasv-pvsheet__item ${active ? 'is-active' : ''}`} onClick={() => onSelect(v.id)}>
                  <span className="pasv-pvsheet__item-ico pasv-pvsheet__item-ico--voucher"><Icon icon={Tag} size="sm" /></span>
                  <span className="pasv-pvsheet__item-body">
                    <span className="pasv-pvsheet__item-label">{v.title}</span>
                    <span className="pasv-pvsheet__item-sub">
                      {v.code}{v.minSpend ? ` · Min. ${formatShort(v.minSpend)}` : ''}
                    </span>
                  </span>
                  {active && <Icon icon={Check} size="sm" className="pasv-pvsheet__item-check" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {vouchers && vouchers.length > 0 && (
        <button type="button" className="pasv-pvsheet__manage" onClick={onViewAll}>
          <Icon icon={Tag} size="sm" /> Lihat semua voucher
          <Icon icon={ChevronRight} size="xs" />
        </button>
      )}
    </div>
  );
}

function formatShort(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}
