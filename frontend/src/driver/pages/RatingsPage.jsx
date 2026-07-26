import React from 'react';
import { Card, Text, Heading, Flex, Button } from '../../design-system/index.js';
import { ChevronLeft, Star, User } from 'lucide-react';

const MOCK_REVIEWS = [
  { id: 1, name: 'Budi', rating: 5, comment: 'Supirnya baik, perjalanan nyaman', date: '2026-07-20' },
  { id: 2, name: 'Siti', rating: 4, comment: 'Tepat waktu, ramah', date: '2026-07-19' },
  { id: 3, name: 'Ahmad', rating: 5, comment: 'Pelayanan memuaskan', date: '2026-07-18' },
  { id: 4, name: 'Dewi', rating: 3, comment: 'Sedikit telat sampai pickup', date: '2026-07-17' },
];

const CATEGORIES = [
  { label: 'Pelayanan', score: 94 },
  { label: 'Ketepatan Waktu', score: 88 },
  { label: 'Kebersihan Kendaraan', score: 92 },
  { label: 'Keamanan Berkendara', score: 95 },
];

export default function RatingsPage({ stats, onBack }) {
  const rating = stats?.rating || 4.9;
  const total = stats?.totalRatings || stats?.total_reviews || 128;

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Rating & Ulasan</h2>
      </header>

      <div className="drv-page-body">
        <Card style={{ textAlign: 'center', marginBottom: 16 }}>
          <Star size={40} color="var(--ds-color-warning)" fill="var(--ds-color-warning)" style={{ margin: '0 auto 8px' }} />
          <Heading size="lg">{rating.toFixed(1)}</Heading>
          <Text size="xs" color="muted">{total} ulasan</Text>
          <Flex gap={4} style={{ justifyContent: 'center', marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16}
                color={s <= Math.round(rating) ? 'var(--ds-color-warning)' : 'var(--ds-color-border)'}
                fill={s <= Math.round(rating) ? 'var(--ds-color-warning)' : 'transparent'} />
            ))}
          </Flex>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <Card key={cat.label}>
              <Text size="xs" color="muted">{cat.label}</Text>
              <Heading size="sm">{cat.score}%</Heading>
              <div style={{
                height: 4, borderRadius: 2, background: 'var(--ds-color-border)', marginTop: 4, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${cat.score}%`, height: '100%', background: 'var(--ds-color-success)', borderRadius: 2,
                }} />
              </div>
            </Card>
          ))}
        </div>

        <Heading size="xs" style={{ marginBottom: 8 }}>Ulasan Terbaru</Heading>
        {MOCK_REVIEWS.map((review) => (
          <Card key={review.id} style={{ marginBottom: 8 }}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Flex gap={8} style={{ alignItems: 'center' }}>
                <User size={20} color="var(--ds-color-text-muted)" />
                <div>
                  <Text size="sm" weight="bold">{review.name}</Text>
                  <Flex gap={4}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12}
                        color={s <= review.rating ? 'var(--ds-color-warning)' : 'var(--ds-color-border)'}
                        fill={s <= review.rating ? 'var(--ds-color-warning)' : 'transparent'} />
                    ))}
                  </Flex>
                </div>
              </Flex>
              <Text size="xs" color="muted">{review.date}</Text>
            </Flex>
            <Text size="sm" style={{ marginTop: 8 }}>{review.comment}</Text>
          </Card>
        ))}
      </div>
    </div>
  );
}
