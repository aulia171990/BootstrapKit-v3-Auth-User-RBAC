import React, { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Upload — file picker (drag/drop + click). Controlled via onFiles.
 * @param {function(FileList)} onFiles
 * @param {string} accept e.g. "image/*"
 * @param {boolean} multiple
 */
export default function Upload({
  onFiles, accept, multiple = false, disabled, label = 'Drop files or click to browse', className, ...rest
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);

  const handle = (list) => {
    const arr = Array.from(list || []);
    setFiles(arr);
    onFiles?.(arr);
  };

  return (
    <div className={cx('ds-upload', drag && 'is-drag', disabled && 'is-disabled', className)}>
      <div
        className="ds-upload__drop"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) handle(e.dataTransfer.files); }}
      >
        <Icon icon={UploadCloud} size="lg" className="ds-upload__icon" />
        <span className="ds-upload__label">{label}</span>
        {accept && <span className="ds-field__hint">{accept}</span>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          hidden
          onChange={(e) => handle(e.target.files)}
          {...rest}
        />
      </div>
      {files.length > 0 && (
        <ul className="ds-upload__list">
          {files.map((f, i) => (
            <li key={i} className="ds-upload__file">
              <Icon icon={FileIcon} size="sm" />
              <span className="ds-upload__name">{f.name}</span>
              <button type="button" className="ds-upload__remove" aria-label="Remove" onClick={() => {
                const next = files.filter((_, j) => j !== i);
                setFiles(next); onFiles?.(next);
              }}>
                <Icon icon={X} size="xs" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
