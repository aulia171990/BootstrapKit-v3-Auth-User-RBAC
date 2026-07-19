import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * ImageUpload — image picker with thumbnail previews (drag/drop + click).
 * @param {function(Array<File>)} onFiles
 * @param {boolean} multiple
 */
export default function ImageUpload({
  onFiles, accept = 'image/*', multiple = false, disabled, label = 'Drop images or click to browse', className, ...rest
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [items, setItems] = useState([]); // { file, url }

  const ingest = (list) => {
    const files = Array.from(list || []).filter((f) => f.type.startsWith('image/'));
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems(multiple ? [...items, ...next] : next.slice(0, 1));
    onFiles?.(next.map((n) => n.file));
  };

  const remove = (i) => {
    const next = items.filter((_, j) => j !== i);
    setItems(next);
    onFiles?.(next.map((n) => n.file));
  };

  return (
    <div className={cx('ds-upload ds-image-upload', drag && 'is-drag', disabled && 'is-disabled', className)} {...rest}>
      <div
        className="ds-upload__drop"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) ingest(e.dataTransfer.files); }}
      >
        <Icon icon={ImagePlus} size="lg" className="ds-upload__icon" />
        <span className="ds-upload__label">{label}</span>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled} hidden onChange={(e) => ingest(e.target.files)} />
      </div>
      {items.length > 0 && (
        <div className="ds-image-upload__grid">
          {items.map((it, i) => (
            <div key={i} className="ds-image-upload__thumb">
              <img src={it.url} alt={it.file.name} />
              <button type="button" className="ds-image-upload__remove" aria-label="Remove image" onClick={() => remove(i)}>
                <Icon icon={X} size="xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
