import React from 'react';
import {
  Badge, Icon, Button, EmptyState, ErrorState,
} from '../../design-system/index.js';
import {
  Bell, Headphones, Car, MapPin, CreditCard, Wallet, Tag, Cpu, MessageCircle, ShieldAlert,
  Check, Share2, ArrowLeft, ExternalLink,
} from 'lucide-react';
import {
  getNotification, markRead,
} from '../communication/notificationStore.js';
import './notificationDetail.css';

// Shared category metadata (mirrors NotificationInbox).
const CATEGORIES = {
  support:    { label: 'Bantuan',    icon: Headphones,  tone: 'info' },
  booking:    { label: 'Pesanan',    icon: Car,         tone: 'primary' },
  trip:       { label: 'Perjalanan', icon: MapPin,      tone: 'primary' },
  payment:    { label: 'Pembayaran', icon: CreditCard,  tone: 'success' },
  wallet:     { label: 'Dompet',     icon: Wallet,      tone: 'success' },
  promotion:  { label: 'Promo',      icon: Tag,         tone: 'warning' },
  system:     { label: 'Sistem',     icon: Cpu,         tone: 'neutral' },
  chat:       { label: 'Chat',       icon: MessageCircle, tone: 'info' },
  security:   { label: 'Keamanan',   icon: ShieldAlert, tone: 'danger' },
};
const fallbackCat = { label: 'Lainnya', icon: Bell, tone: 'neutral' };

const PRIORITY_LABEL = { high: 'Penting', normal: 'Normal', low: 'Rendah' };

function absTime(iso) {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}
function relTime(iso) {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.round(hrs / 24)} hari lalu`;
}

// Map a notification's data.type to a "related" action.
function relatedAction(n) {
  const d = n?.data || {};
  switch (d.type) {
    case 'trip': return { label: 'Buka Perjalanan Terkait', to: 'trip' };
    case 'booking': return { label: 'Buka Pesanan Terkait', to: 'booking' };
    case 'payment':
    case 'wallet': return { label: d.type === 'wallet' ? 'Buka Dompet' : 'Buka Pembayaran', to: 'payment' };
    case 'promotion': return { label: 'Buka Promo', to: 'promotion' };
    case 'support':
    case 'refund': return { label: 'Buka Bantuan', to: 'support' };
    case 'chat': return { label: 'Buka Chat', to: 'chat' };
    default: return null;
  }
}

export default function NotificationDetail({
  notification: initial,
  onBack,
  onOpenRelated,
  onShare,
}) {
  const n = initial && initial.id ? getNotification(initial.id) || initial : initial;
  if (!n) {
    return (
      <div className="pasv-nd">
        <header className="pasv-nd__bar">
          <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ArrowLeft} size="md" /></button>
          <h1 className="pasv-nd__title">Detail Notifikasi</h1>
        </header>
        <div className="pasv-nd__body">
          <EmptyState icon={Bell} title="Notifikasi tidak ditemukan" description="Notifikasi ini mungkin telah dihapus." />
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[n.category] || fallbackCat;
  const action = relatedAction(n);

  const handleMarkRead = () => markRead(n.id);
  const handleShare = () => onShare?.(n);
  const handleRelated = () => onOpenRelated?.(n);

  return (
    <div className="pasv-nd">
      <header className="pasv-nd__bar">
        <button type="button" className="pasv-ico-btn" aria-label="Kembali" onClick={onBack}><Icon icon={ArrowLeft} size="md" /></button>
        <h1 className="pasv-nd__title">Detail Notifikasi</h1>
        <span className="pasv-nd__bar-spacer" />
      </header>

      <div className="pasv-nd__body">
        <section className="pasv-nd__card" aria-label={cat.label}>
          <span className={`pasv-nd__ico pasv-nd__ico--${cat.tone}`}>
            <Icon icon={cat.icon} size="md" />
          </span>
          <div className="pasv-nd__head">
            <div className="pasv-nd__badges">
              <Badge tone={cat.tone}>{cat.label}</Badge>
              {n.priority === 'high' && <Badge tone="danger">Penting</Badge>}
              {n.unread && <Badge tone="info">Belum dibaca</Badge>}
            </div>
            <h2 className="pasv-nd__title-main">{n.title}</h2>
            <p className="pasv-nd__msg">{n.message}</p>
            <div className="pasv-nd__meta">
              <span className="pasv-nd__rel">{relTime(n.timestamp)}</span>
              <span className="pasv-nd__abs">{absTime(n.timestamp)}</span>
            </div>
          </div>
        </section>

        {action && (
          <section className="pasv-nd__actions">
            <Button variant="primary" fullWidth leftIcon={ExternalLink} onClick={handleRelated}>
              {action.label}
            </Button>
          </section>
        )}

        <section className="pasv-nd__actions pasv-nd__actions--row">
          {n.unread && (
            <Button variant="outline" fullWidth leftIcon={Check} onClick={handleMarkRead}>
              Tandai Dibaca
            </Button>
          )}
          <Button variant="outline" fullWidth leftIcon={Share2} onClick={handleShare}>
            Bagikan
          </Button>
        </section>
      </div>
    </div>
  );
}
