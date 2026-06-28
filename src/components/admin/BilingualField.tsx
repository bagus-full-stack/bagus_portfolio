import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  label: string
  fieldFr: string
  fieldEn: string
  onChangeFr: (value: string) => void
  onChangeEn: (value: string) => void
  multiline?: boolean
  maxLength?: number
}

const BilingualField = ({
  label, fieldFr, fieldEn,
  onChangeFr, onChangeEn,
  multiline = false, maxLength
}: Props) => (
  <div className="space-y-2">
    <label className="text-[var(--text-primary)] font-[Inter] text-sm font-medium">
      {label}
    </label>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

      {/* Colonne FR */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-[JetBrains_Mono] text-[var(--text-muted)]">
            🇫🇷 Français
          </span>
          {maxLength && (
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {(fieldFr || '').length}/{maxLength}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            value={fieldFr || ''}
            onChange={e => onChangeFr(e.target.value)}
            maxLength={maxLength}
            rows={3}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-[Inter] text-sm resize-none focus:outline-none focus:border-[var(--accent-cyan)]"
          />
        ) : (
          <input
            type="text"
            value={fieldFr || ''}
            onChange={e => onChangeFr(e.target.value)}
            maxLength={maxLength}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-[Inter] text-sm focus:outline-none focus:border-[var(--accent-cyan)]"
          />
        )}
      </div>

      {/* Colonne EN */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-[JetBrains_Mono] text-[var(--text-muted)]">
            🇬🇧 English
          </span>
          {maxLength && (
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {(fieldEn || '').length}/{maxLength}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            value={fieldEn || ''}
            onChange={e => onChangeEn(e.target.value)}
            maxLength={maxLength}
            rows={3}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-[Inter] text-sm resize-none focus:outline-none focus:border-[var(--accent-cyan)]"
          />
        ) : (
          <input
            type="text"
            value={fieldEn || ''}
            onChange={e => onChangeEn(e.target.value)}
            maxLength={maxLength}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] font-[Inter] text-sm focus:outline-none focus:border-[var(--accent-cyan)]"
          />
        )}
        {(fieldEn || '').trim() === '' && (fieldFr || '').trim() !== '' && (
          <p className="text-xs text-[#F59E0B] font-[JetBrains_Mono] flex items-center gap-1">
            <AlertTriangle size={10} />
            Traduction anglaise manquante
          </p>
        )}
      </div>
    </div>
  </div>
)

export default BilingualField
