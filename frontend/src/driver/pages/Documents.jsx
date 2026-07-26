import React, { useState } from 'react';
import { Card, Text, Heading, Flex, Button } from '../../design-system/index.js';
import { ChevronLeft, FileText, CheckCircle, AlertCircle, Clock, Upload } from 'lucide-react';

const DOCUMENTS = [
  { id: 'ktp', label: 'KTP', desc: 'Kartu Tanda Penduduk', icon: FileText },
  { id: 'sim', label: 'SIM', desc: 'Surat Izin Mengemudi', icon: FileText },
  { id: 'stnk', label: 'STNK', desc: 'Surat Tanda Nomor Kendaraan', icon: FileText },
  { id: 'vehicle_photo', label: 'Foto Kendaraan', desc: 'Foto tampak depan & belakang', icon: FileText },
  { id: 'selfie', label: 'Selfie + KTP', desc: 'Foto selfie memegang KTP', icon: FileText },
];

export default function Documents({ documents: initialDocs, onBack, onUpload }) {
  const [docs, setDocs] = useState(initialDocs || {});
  const [uploading, setUploading] = useState(null);

  const statusIcon = (status) => {
    if (status === 'verified') return <CheckCircle size={18} color="var(--ds-color-success)" />;
    if (status === 'rejected') return <AlertCircle size={18} color="var(--ds-color-danger)" />;
    if (status === 'pending') return <Clock size={18} color="var(--ds-color-warning)" />;
    return null;
  };

  const statusLabel = (status) => {
    if (status === 'verified') return 'Terverifikasi';
    if (status === 'rejected') return 'Ditolak';
    if (status === 'pending') return 'Menunggu';
    return 'Belum diunggah';
  };

  const handleUpload = async (docId) => {
    setUploading(docId);
    await new Promise((r) => setTimeout(r, 1000));
    setDocs((prev) => ({ ...prev, [docId]: { status: 'pending', url: '#' } }));
    setUploading(null);
    onUpload?.(docId);
  };

  return (
    <div className="drv-page">
      <header className="drv-page-header">
        <button className="drv-page-back" onClick={onBack}><ChevronLeft size={20} /></button>
        <h2>Dokumen</h2>
      </header>

      <div className="drv-page-body">
        <Text size="xs" color="muted" style={{ marginBottom: 16 }}>
          Unggah dokumen untuk verifikasi akun driver Anda.
        </Text>

        {DOCUMENTS.map((doc) => {
          const docData = docs[doc.id];
          const Icon = doc.icon;
          return (
            <Card key={doc.id} style={{ marginBottom: 8 }}>
              <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Flex gap={12} style={{ alignItems: 'center' }}>
                  <Icon size={24} color="var(--ds-color-primary)" />
                  <div>
                    <Text size="sm" weight="bold">{doc.label}</Text>
                    <Text size="xs" color="muted">{doc.desc}</Text>
                  </div>
                </Flex>
                <Flex gap={8} style={{ alignItems: 'center' }}>
                  {docData?.status === 'verified' ? (
                    statusIcon('verified')
                  ) : (
                    <Button size="xs" variant={docData?.status === 'rejected' ? 'danger' : 'outline'}
                      onClick={() => handleUpload(doc.id)} disabled={uploading === doc.id}>
                      {uploading === doc.id ? '...' : docData?.status === 'rejected' ? 'Upload Ulang' : 'Upload'}
                    </Button>
                  )}
                </Flex>
              </Flex>
              {docData && (
                <Text size="xs" color={docData.status === 'verified' ? 'success' : docData.status === 'rejected' ? 'danger' : 'warning'}
                  style={{ marginTop: 4 }}>
                  {statusLabel(docData.status)}
                </Text>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
