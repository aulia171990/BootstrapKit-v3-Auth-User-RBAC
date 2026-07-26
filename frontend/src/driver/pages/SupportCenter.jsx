import React, { useState } from 'react';
import { Card, Text, Heading, Flex, Button } from '../../design-system/index.js';
import { ChevronLeft, HelpCircle, MessageSquare, Phone, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const FAQS = [
  { q: 'Bagaimana cara menerima pesanan?', a: 'Pastikan status Anda Online. Pesanan baru akan muncul sebagai notifikasi. Tap Terima untuk mengambil pesanan.' },
  { q: 'Berapa komisi aplikasi?', a: 'Komisi aplikasi adalah 20% dari total tarif perjalanan. Detail perhitungan dapat dilihat di halaman Pendapatan.' },
  { q: 'Bagaimana cara top up dompet?', a: 'Buka halaman Dompet, tap Top Up, pilih nominal dan metode pembayaran. Saldo akan masuk secara otomatis.' },
  { q: 'Kapan pencairan pendapatan?', a: 'Pendapatan dapat dicairkan setiap hari minimal Rp 50.000 dengan rate Rp 1.000 per pencairan.' },
  { q: 'Bagaimana jika ada masalah dengan penumpang?', a: 'Gunakan fitur Darurat (SOS) di halaman Safety atau hubungi Support melalui tombol Hubungi Kami.' },
];

const CONTACTS = [
  { icon: MessageSquare, label: 'Live Chat', desc: '24 jam', action: 'Chat' },
  { icon: Phone, label: 'Telepon', desc: '08.00 - 20.00', action: 'Hubungi' },
  { icon: FileText, label: 'Pusat Bantuan', desc: 'Artikel & panduan', action: 'Buka' },
];

export default function SupportCenter({ onBack }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Pusat Bantuan</h2>
      </header>

      <div className="drv-page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {CONTACTS.map((c) => (
            <Card key={c.label} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <c.icon size={24} color="var(--ds-color-primary)" style={{ margin: '0 auto 6px' }} />
              <Text size="sm" weight="bold">{c.label}</Text>
              <Text size="xs" color="muted">{c.desc}</Text>
            </Card>
          ))}
        </div>

        <Heading size="xs" style={{ marginBottom: 8 }}>Pertanyaan Umum (FAQ)</Heading>
        {FAQS.map((faq, i) => (
          <Card key={i} style={{ marginBottom: 6, cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="sm" weight="bold">{faq.q}</Text>
              {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Flex>
            {openFaq === i && (
              <Text size="sm" color="muted" style={{ marginTop: 8 }}>{faq.a}</Text>
            )}
          </Card>
        ))}

        <Card style={{ marginTop: 16, textAlign: 'center', background: 'var(--ds-color-primary-bg, #eff6ff)' }}>
          <HelpCircle size={24} color="var(--ds-color-primary)" style={{ margin: '0 auto 8px' }} />
          <Heading size="xs">Butuh bantuan lebih lanjut?</Heading>
          <Text size="xs" color="muted" style={{ marginBottom: 12 }}>
            Tim support kami siap membantu Anda
          </Text>
          <Button variant="primary" size="sm">Hubungi Kami</Button>
        </Card>
      </div>
    </div>
  );
}
