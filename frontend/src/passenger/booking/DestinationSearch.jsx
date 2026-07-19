import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Input, MapContainer, CurrentLocationButton, EmptyState, Loading, ErrorState, Icon,
} from '../../design-system/index.js';
import {
  ChevronLeft, Search as SearchIcon, LocateFixed, Home, Building2, Heart, Star, Clock, X, MapPin,
} from 'lucide-react';
import * as papi from '../api.js';
import './booking.css';

const SHORTCUTS = [
  { id: 'current', label: 'Lokasi', icon: LocateFixed, color: '#0ea5e9' },
  { id: 'home', label: 'Rumah', icon: Home, color: '#4f46e5' },
  { id: 'office', label: 'Kantor', icon: Building2, color: '#10b981' },
  { id: 'saved', label: 'Tersimpan', icon: Heart, color: '#f97316' },
];
const ICONS = { home: Home, building: Building2, plane: MapPin, train: MapPin, coffee: Star, heart: Heart, 'shopping-bag': MapPin, 'graduation-cap': MapPin, 'shopping-cart': MapPin, tree: MapPin };

function highlight(text, query) {
  const q = (query || '').trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="pasv-book__hl">{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
}

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

export default function DestinationSearch({ user, onBack, onSelectDestination }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | searching | error
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [active, setActive] = useState(-1); // keyboard highlight index across the visible list
  const debounced = useDebounced(query);
  const inputRef = useRef(null);

  const loadBase = useCallback(async () => {
    setStatus('loading');
    try {
      const [favs, loc, rec] = await Promise.all([papi.getFavorites(), papi.getCurrentLocation(), Promise.resolve(papi.getRecentSearches())]);
      setFavorites(favs); setCurrentLoc(loc); setRecents(rec);
      setStatus('ready');
    } catch { setStatus('error'); }
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) { setSuggestions([]); setActive(-1); return; }
    setStatus('searching');
    papi.getPlaceSuggestions(debounced).then((res) => {
      if (cancelled) return;
      setSuggestions(res); setActive(-1); setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [debounced]);

  // Flattened visible list for keyboard navigation + aria.
  const sections = useMemo(() => {
    if (suggestions.length) return [{ key: 'suggestions', title: 'Saran', items: suggestions }];
    const out = [];
    if (recents.length) out.push({ key: 'recent', title: 'Pencarian terakhir', items: recents, clearable: true });
    if (favorites.length) out.push({ key: 'fav', title: 'Tempat favorit', items: favorites });
    return out;
  }, [suggestions, recents, favorites]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items.map((it) => ({ ...it, _section: s.key }))), [sections]);

  const select = useCallback((place) => {
    papi.addRecentSearch(place);
    setRecents(papi.getRecentSearches());
    onSelectDestination?.(place); // → Pickup Selection (3B-2B); not built this sprint
  }, [onSelectDestination]);

  const onKeyDown = (e) => {
    if (!flatItems.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flatItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { if (active >= 0) { e.preventDefault(); select(flatItems[active]); } }
    else if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); }
  };

  const shortcutPick = (s) => {
    if (s.id === 'current') { select({ id: 'current', title: currentLoc?.address || 'Lokasi saat ini', subtitle: 'Lokasi saat ini', icon: 'locate' }); return; }
    if (s.id === 'home') { const h = favorites.find((f) => f.title.toLowerCase().includes('rumah')) || { id: 'home', title: 'Rumah', subtitle: 'Jl. Merdeka No. 12', icon: 'home' }; select(h); return; }
    if (s.id === 'office') { const o = favorites.find((f) => f.title.toLowerCase().includes('kantor')) || { id: 'office', title: 'Kantor', subtitle: 'Menara BCA, Sudirman', icon: 'building' }; select(o); return; }
    // saved → jump to favorites section (no-op select)
  };

  const renderIcon = (icon) => {
    const C = ICONS[icon] || MapPin;
    return <Icon icon={C} size="sm" />;
  };

  if (status === 'error') {
    return (
      <div className="pasv-book">
        <Bar onBack={onBack} title="Cari Tujuan" />
        <div className="pasv-book__scroll"><ErrorState title="Gagal memuat" description="Tidak dapat mengambil daftar tempat." action={<button type="button" className="pasv-iconbtn" onClick={loadBase}>Coba lagi</button>} /></div>
      </div>
    );
  }

  return (
    <div className="pasv-book">
      <Bar onBack={onBack} title="Cari Tujuan" />

      <div className="pasv-book__scroll">
        {/* Search input */}
        <div className="pasv-book__search">
          <Input
            ref={inputRef}
            leftIcon={SearchIcon}
            placeholder="Cari tujuan atau alamat…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Cari tujuan"
            autoComplete="off"
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls="pasv-dest-list"
            aria-activedescendant={active >= 0 ? `pasv-dest-${active}` : undefined}
          />
          {status === 'searching' && <span className="pasv-book__spinner"><Loading size="sm" /></span>}
          {query && <button type="button" className="pasv-book__spinner pasv-iconbtn" style={{ right: 8, width: 32, height: 32 }} aria-label="Hapus" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><Icon icon={X} size="xs" /></button>}
        </div>

        {/* Shortcuts */}
        <div className="pasv-book__shortcuts" role="group" aria-label="Pintasan lokasi">
          {SHORTCUTS.map((s) => (
            <button key={s.id} type="button" className="pasv-book__shortcut" onClick={() => shortcutPick(s)} aria-label={s.label}>
              <span className="pasv-book__shortcut__icon" style={{ background: s.color }}><Icon icon={s.icon} size="md" /></span>
              <span className="pasv-book__shortcut__label">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Map summary */}
        <MapContainer height={140} placeholder="Peta lokasi tujuan">
          <CurrentLocationButton active onClick={() => shortcutPick({ id: 'current' })} />
        </MapContainer>

        {/* Results / suggestions / recents */}
        {status === 'loading' ? (
          <Loading label="Memuat tempat…" />
        ) : (
          <div id="pasv-dest-list" role="listbox" aria-label="Daftar tujuan">
            {(() => {
              const searching = query.trim().length > 0;
              const noResults = searching && suggestions.length === 0;
              if (noResults) {
                return <EmptyState icon={SearchIcon} title="Tidak ditemukan" description={`Tidak ada hasil untuk "${query}".`} />;
              }
              if (!searching && sections.length === 0) {
                return <EmptyState icon={SearchIcon} title="Belum ada tujuan" description="Mulai ketik untuk mencari alamat tujuan." />;
              }
              return sections.map((sec) => (
                <section key={sec.key} aria-label={sec.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
                  <h2 className="pasv-book__section-title">
                    {sec.title}
                    {sec.clearable && recents.length > 0 && (
                      <button type="button" className="pasv-book__clear" onClick={() => { papi.clearRecentSearches(); setRecents([]); }}>Hapus</button>
                    )}
                  </h2>
                  <ul className="pasv-book__list">
                    {sec.items.map((it) => {
                      const flatIdx = flatItems.findIndex((f) => f.id === it.id && f._section === sec.key);
                      return (
                        <li key={it.id} role="option" aria-selected={active === flatIdx} id={`pasv-dest-${flatIdx}`}>
                          <button
                            type="button"
                            className={`pasv-book__row ${active === flatIdx ? 'is-active' : ''}`}
                            onClick={() => select(it)}
                            onMouseEnter={() => setActive(flatIdx)}
                          >
                            <span className="pasv-book__row__icon">{renderIcon(it.icon)}</span>
                            <span className="pasv-book__row__body">
                              <span className="pasv-book__row__title">{highlight(it.title, query)}</span>
                              {it.subtitle && <span className="pasv-book__row__sub">{highlight(it.subtitle, query)}</span>}
                            </span>
                            {sec.key === 'recent' && <span className="pasv-book__row__trail"><Icon icon={Clock} size="xs" /></span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ onBack, title }) {
  return (
    <header className="pasv-book__bar">
      <button type="button" className="pasv-book__back" aria-label="Kembali" onClick={onBack}><Icon icon={ChevronLeft} size="md" /></button>
      <h1 className="pasv-book__title">{title}</h1>
    </header>
  );
}
