import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, Avatar, Icon, StatusIndicator, Toast,
} from '../design-system/index.js';
import {
  ChevronLeft, Tag, Percent, Calendar, Clock, DollarSign, Users,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight,
  ShoppingCart, TrendingDown, Zap, Car, Navigation,
} from 'lucide-react';
import './admin.css';

const STATUS_LABELS = {
  active: 'Aktif', scheduled: 'Terjadwal', expired: 'Kadaluarsa', disabled: 'Nonaktif',
};
const STATUS_COLORS = {
  active: 'success', scheduled: 'info', expired: 'neutral', disabled: 'danger',
};
const DISCOUNT_TYPE_LABELS = { percentage: 'Persentase', fixed: 'Nominal' };
const SERVICE_LABELS = { motor: 'Motor', mobil: 'Mobil', taksi: 'Taksi' };
const SERVICE_ICONS = { motor: <Zap size={10} />, mobil: <Car size={10} />, taksi: <Navigation size={10} /> };

export default function PromotionDetail({ promoId, onBack, onNavigate }) {
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setPromo({
        id: promoId,
        code: 'HEMAT50',
        type: 'percentage',
        value: 50,
        minPurchase: 50000,
        maxDiscount: 50000,
        description: 'Diskon besar-besaran untuk semua trip',
        terms: 'Berlaku untuk semua layanan. Maksimal diskon Rp 50.000. Tidak dapat digabungkan dengan promo lain.',
        status: 'active',
        usageCount: 342,
        usageLimit: 1000,
        usedByUsers: 285,
        revenueImpact: 8500000,
        startDate: new Date(Date.now() - 30 * 86400e3).toISOString(),
        endDate: new Date(Date.now() + 30 * 86400e3).toISOString(),
        createdAt: new Date(Date.now() - 35 * 86400e3).toISOString(),
        applicableServices: ['motor', 'mobil', 'taksi'],
        createdBy: 'Admin',
        timeline: [
          { time: new Date(Date.now() - 35 * 86400e3).toISOString(), event: 'Promo dibuat', icon: 'tag' },
          { time: new Date(Date.now() - 30 * 86400e3).toISOString(), event: 'Promo mulai berlaku', icon: 'play' },
          { time: new Date(Date.now() - 86400e3).toISOString(), event: `${342} kali digunakan`, icon: 'users' },
        ],
      });
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [promoId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async () => {
    setActionBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setPromo((prev) => ({ ...prev, status: prev.status === 'active' ? 'disabled' : 'active' }));
      setToast({ variant: 'success', message: `Promo ${promo?.status === 'active' ? 'dinonaktifkan' : 'diaktifkan'}` });
    } catch { setToast({ variant: 'error', message: 'Gagal mengubah status' }); }
    finally { setActionBusy(false); }
  };

  const TimelineIcon = ({ icon }) => {
    const icons = {
      tag: <Tag size={14} />, play: <CheckCircle size={14} />, users: <Users size={14} />,
    };
    return icons[icon] || <Clock size={14} />;
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Skeleton variant="rect" width={36} height={36} radius="sm" />
          <Skeleton variant="rect" width={200} height={36} radius="sm" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 3 }}><Skeleton variant="card" lines={8} /></div>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={4} /></div>
        </div>
      </div>
    );
  }

  if (error || !promo) {
    return <ErrorState title="Gagal memuat detail promo" description={`ID: ${promoId}`} action={<Button variant="primary" onClick={load}>Coba lagi</Button>} />;
  }

  const remainingQuota = promo.usageLimit - promo.usageCount;
  const usagePercent = (promo.usageCount / promo.usageLimit) * 100;

  return (
    <div>
      <div className="admin-detail__header">
        <button type="button" className="admin-detail__back" onClick={onBack} aria-label="Kembali">
          <ChevronLeft size={18} />
        </button>
        <div className="admin-detail__header-info">
          <div style={{ background: 'var(--ds-color-primary-soft, #eef2ff)', borderRadius: 10, padding: '8px 10px', display: 'grid', placeItems: 'center' }}>
            <Tag size={18} style={{ color: 'var(--ds-color-primary, #4f46e5)' }} />
          </div>
          <div>
            <h2 className="admin-detail__title" style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 1 }}>{promo.code}</h2>
            <div className="admin-detail__sub">{promo.description}</div>
          </div>
        </div>
        <div className="admin-detail__header-actions">
          <Badge variant={STATUS_COLORS[promo.status] || 'neutral'} size="md">
            {STATUS_LABELS[promo.status] || promo.status}
          </Badge>
          {promo.status !== 'expired' && (
            <Button variant={promo.status === 'active' ? 'warning' : 'success'} size="sm" onClick={handleToggleStatus} disabled={actionBusy}>
              {promo.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          )}
        </div>
      </div>

      <div className="admin-detail__grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Aturan Diskon</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Percent size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Tipe Diskon</div><div>{DISCOUNT_TYPE_LABELS[promo.type] || promo.type}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Tag size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Nilai Diskon</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ds-color-primary, #4f46e5)' }}>
                    {promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}
                  </div></div>
                </div>
                <div className="admin-detail__info-row">
                  <ShoppingCart size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Min. Pembelian</div><div>Rp {promo.minPurchase.toLocaleString('id-ID')}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <TrendingDown size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Maks. Diskon</div><div>Rp {promo.maxDiscount.toLocaleString('id-ID')}</div></div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Layanan</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {promo.applicableServices.map((svc) => (
                  <Badge key={svc} variant="info" size="sm">
                    {SERVICE_ICONS[svc] || null} {SERVICE_LABELS[svc] || svc}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Syarat & Ketentuan</h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--ds-color-text-muted, #6b7280)' }}>{promo.terms}</p>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Kronologi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {promo.timeline.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: idx === promo.timeline.length - 1 ? 'var(--ds-color-primary, #4f46e5)' : 'var(--ds-color-surface-2, #f1f5f9)',
                        color: idx === promo.timeline.length - 1 ? '#fff' : 'var(--ds-color-text-muted)',
                        display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0,
                      }}>
                        <TimelineIcon icon={entry.icon} />
                      </div>
                      {idx < promo.timeline.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--ds-color-border, #eceef3)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < promo.timeline.length - 1 ? 8 : 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ds-color-text, #111)' }}>{entry.event}</div>
                      <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted, #8a90a2)', marginTop: 2 }}>
                        {new Date(entry.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Jadwal</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Calendar size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Mulai</div><div>{new Date(promo.startDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Calendar size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Berakhir</div><div>{new Date(promo.endDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <Clock size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Dibuat</div><div>{new Date(promo.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                </div>
                <div className="admin-detail__info-row">
                  <User size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Dibuat oleh</div><div>{promo.createdBy}</div></div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Statistik Pemakaian</h3>
              <div className="admin-detail__info">
                <div className="admin-detail__info-row">
                  <Tag size={14} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ds-color-text-muted)' }}>Digunakan</div><div style={{ fontWeight: 600 }}>{promo.usageCount.toLocaleString('id-ID')} / {promo.usageLimit.toLocaleString('id-ID')}</div></div>
                </div>
              </div>
              <div style={{
                width: '100%', height: 8, background: 'var(--ds-color-surface-2, #f1f5f9)',
                borderRadius: 4, marginTop: 6, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(usagePercent, 100)}%`, height: '100%',
                  background: usagePercent > 80 ? 'var(--ds-color-danger, #dc2626)' : 'var(--ds-color-primary, #4f46e5)',
                  borderRadius: 4, transition: 'width 300ms',
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted, #8a90a2)', marginTop: 4 }}>
                Sisa {remainingQuota.toLocaleString('id-ID')} kuota ({Math.round(100 - usagePercent)}%)
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Pengguna</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{promo.usedByUsers.toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Dampak</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ds-color-danger, #dc2626)' }}>−Rp {promo.revenueImpact.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
