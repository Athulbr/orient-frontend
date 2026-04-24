import React, { useState, useRef } from 'react';
import '../styles/FileUpload.css';

export type ReconType = 'bank' | 'qr' | 'gateway';

interface FileUploadProps {
  onUpload: (
    bookFile: File,
    statementFile: File,
    prevBrsFile: File | null,
    reconType: ReconType,
    hotBookFile?: File | null,
    // gateway extras
    payuOdFiles?: File[],
    cashfreeFile?: File | null,
    easebuzzFile?: File | null,
    payuFile?: File | null,
  ) => void;
  isLoading: boolean;
}

const VALID_EXT      = ['.xlsx', '.xls', '.csv'];
const VALID_EXT_PDF  = ['.xlsx', '.xls', '.csv', '.pdf'];

// ── Slot renderer helper types ────────────────────────────────────────────────
interface SlotConfig {
  id: string;
  label: string;
  sublabel: string;
  ref: React.RefObject<HTMLInputElement | null>;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  required?: boolean;
  accent?: 'qr' | 'gateway';
  accept?: string;
  icon?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [reconType,    setReconType]   = useState<ReconType | null>(null);
  const [bookFile,     setBookFile]    = useState<File | null>(null);
  const [hotBookFile,  setHotBookFile] = useState<File | null>(null);
  const [statFile,     setStatFile]    = useState<File | null>(null);
  const [prevBrsFile,  setPrevFile]    = useState<File | null>(null);
  // Gateway extras
  const [payuFile,     setPayuFile]    = useState<File | null>(null);
  const [payuOdFiles,  setPayuOdFiles] = useState<File[]>([]);
  const [cashfreeFile, setCashfree]    = useState<File | null>(null);
  const [easebuzzFile, setEasebuzz]    = useState<File | null>(null);

  const [errors,    setErrors]    = useState<string[]>([]);
  const [dragOver,  setDragOver]  = useState<string | null>(null);

  // Refs
  const bookRef     = useRef<HTMLInputElement>(null);
  const hotBookRef  = useRef<HTMLInputElement>(null);
  const stmtRef     = useRef<HTMLInputElement>(null);
  const prevRef     = useRef<HTMLInputElement>(null);
  const payuRef     = useRef<HTMLInputElement>(null);
  const payuOdRef   = useRef<HTMLInputElement>(null);
  const cashfreeRef = useRef<HTMLInputElement>(null);
  const easebuzzRef = useRef<HTMLInputElement>(null);

  const validate = (file: File, allowPdf = false): boolean => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = allowPdf ? VALID_EXT_PDF : VALID_EXT;
    if (!allowed.includes(ext)) {
      setErrors([`"${file.name}" is not supported. Use ${allowed.join(', ')}.`]);
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleSelectType = (type: ReconType) => {
    setReconType(type);
    setBookFile(null); setHotBookFile(null); setStatFile(null); setPrevFile(null);
    setPayuFile(null); setPayuOdFiles([]); setCashfree(null); setEasebuzz(null);
    setErrors([]);
  };

  const handleDrop = (e: React.DragEvent, slot: string) => {
    e.preventDefault(); setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (slot === 'book')     { if (validate(file)) setBookFile(file); }
    if (slot === 'hotbook')  { if (validate(file)) setHotBookFile(file); }
    if (slot === 'stmt')     { if (validate(file, reconType === 'gateway')) setStatFile(file); }
    if (slot === 'prev')     { if (validate(file)) setPrevFile(file); }
    if (slot === 'payu')     { if (validate(file)) setPayuFile(file); }
    if (slot === 'cashfree') { if (validate(file)) setCashfree(file); }
    if (slot === 'easebuzz') { if (validate(file, true)) setEasebuzz(file); }
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (reconType === 'bank') {
      if (!bookFile) errs.push('Book Report is required.');
      if (!statFile) errs.push('Bank Statement is required.');
    } else if (reconType === 'qr') {
      if (!bookFile)   errs.push('All-Branches Book Report is required.');
      if (!hotBookFile) errs.push('HOT Book Report is required.');
      if (!statFile)   errs.push('QR Statement is required.');
    } else if (reconType === 'gateway') {
      if (!bookFile)  errs.push('All-Branches Book is required.');
      if (!hotBookFile) errs.push('HOT Book is required.');
      if (!statFile)  errs.push('YES Bank Statement (PDF) is required.');
      if (!payuFile)  errs.push('PayU Regular report is required.');
    }
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    onUpload(
      bookFile!, statFile!, prevBrsFile, reconType!,
      hotBookFile,
      payuOdFiles.length > 0 ? payuOdFiles : [],
      cashfreeFile,
      easebuzzFile,
      payuFile,
    );
  };

  const isQR      = reconType === 'qr';
  const isGateway = reconType === 'gateway';
  const canSubmit = reconType && !isLoading && (() => {
    if (reconType === 'bank')    return !!bookFile && !!statFile;
    if (reconType === 'qr')     return !!bookFile && !!hotBookFile && !!statFile;
    if (reconType === 'gateway') return !!bookFile && !!hotBookFile && !!statFile && !!payuFile;
    return false;
  })();

  // ── Slot renderer ─────────────────────────────────────────────────────────
  const renderSlot = (cfg: SlotConfig) => {
    const { id, label, sublabel, ref, file, onFile, onClear,
            required = true, accent, accept = '.xlsx,.xls,.csv', icon = '📄' } = cfg;
    const isDragging = dragOver === id;
    return (
      <div
        key={id}
        className={[
          'upload-slot',
          isDragging         ? 'upload-slot--drag'    : '',
          file               ? 'upload-slot--filled'  : '',
          accent && file     ? `upload-slot--${accent}` : '',
        ].filter(Boolean).join(' ')}
        onDragOver={e => { e.preventDefault(); setDragOver(id); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={e => handleDrop(e, id)}
        onClick={() => !isLoading && !file && ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="file-input"
          disabled={isLoading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />
        {!file ? (
          <div className="slot-empty">
            <div className="slot-icon">{icon}</div>
            <div className="slot-text">
              <p className="slot-label">
                {label}
                {!required && <span className="slot-optional">Optional</span>}
              </p>
              <p className="slot-sub">{sublabel}</p>
              <p className="slot-formats">{accept.split(',').join(' · ')}</p>
            </div>
            <div className="slot-cta">Click or drag file here</div>
          </div>
        ) : (
          <div className="slot-filled" onClick={e => e.stopPropagation()}>
            <div className="slot-filled-icon">✓</div>
            <div className="slot-filled-info">
              <p className="slot-filled-label">{label}</p>
              <p className="slot-filled-name" title={file.name}>{file.name}</p>
            </div>
            <button className="slot-remove" disabled={isLoading}
              onClick={e => { e.stopPropagation(); onClear(); }} aria-label="Remove file">✕</button>
          </div>
        )}
      </div>
    );
  };

  // ── PayU OD multi-file — same card shape as other slots ─────────────────
  const renderPayuOdSlot = () => {
    const hasFIles = payuOdFiles.length > 0;
    return (
      <div
        className={`upload-slot${hasFIles ? ' upload-slot--filled upload-slot--gateway' : ''}`}
        style={{ height: 'auto', minHeight: '160px' }}
        onClick={() => !isLoading && payuOdRef.current?.click()}
      >
        <input ref={payuOdRef} type="file" accept=".xlsx,.xls,.csv" className="file-input"
          multiple disabled={isLoading}
          onChange={e => {
            const files = Array.from(e.target.files || []);
            const valid = files.filter(f => validate(f));
            if (valid.length) setPayuOdFiles(prev => [...prev, ...valid]);
            e.target.value = '';
          }}
        />

        {!hasFIles ? (
          /* ── Empty state — identical structure to other slots ── */
          <div className="slot-empty">
            <div className="slot-icon">📂</div>
            <div className="slot-text">
              <p className="slot-label">
                PayU On-Demand
                <span className="slot-optional">Optional</span>
              </p>
              <p className="slot-sub">Multiple files allowed (.xlsx)</p>
              <p className="slot-formats">.xlsx · .xls · .csv</p>
            </div>
            <div className="slot-cta">Click or drag file(s) here</div>
          </div>
        ) : (
          /* ── Filled state — file list + add more ── */
          <div className="slot-od-filled" onClick={e => e.stopPropagation()}>
            <div className="slot-od-header">
              <div className="slot-filled-icon">✓</div>
              <div className="slot-od-title">
                <p className="slot-filled-label">PayU On-Demand</p>
                <p className="slot-od-count">{payuOdFiles.length} file{payuOdFiles.length > 1 ? 's' : ''} added</p>
              </div>
              <button
                className="slot-od-add"
                disabled={isLoading}
                onClick={e => { e.stopPropagation(); payuOdRef.current?.click(); }}
              >+ Add more</button>
            </div>
            <div className="slot-od-list">
              {payuOdFiles.map((f, i) => (
                <div key={i} className="slot-od-item">
                  <span className="slot-od-name" title={f.name}>{f.name}</span>
                  <button
                    className="slot-remove"
                    disabled={isLoading}
                    onClick={e => { e.stopPropagation(); setPayuOdFiles(prev => prev.filter((_, j) => j !== i)); }}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Grid layout per type ──────────────────────────────────────────────────
  const renderSlots = () => {
    if (!reconType) return null;

    if (reconType === 'bank') return (
      <div className="upload-slots upload-slots--bank">
        {renderSlot({ id:'book', label:'Book Report', sublabel:'Company ledger / book entries',
          ref:bookRef, file:bookFile, icon:'📗',
          onFile:f=>{if(validate(f))setBookFile(f);}, onClear:()=>setBookFile(null) })}
        {renderSlot({ id:'stmt', label:'Bank Statement', sublabel:'Bank transaction statement',
          ref:stmtRef, file:statFile, icon:'🏦',
          onFile:f=>{if(validate(f))setStatFile(f);}, onClear:()=>setStatFile(null) })}
        {renderSlot({ id:'prev', label:'Previous BRS', sublabel:'For carry-forward matching',
          ref:prevRef, file:prevBrsFile, icon:'🗂️', required:false,
          onFile:f=>{if(validate(f))setPrevFile(f);}, onClear:()=>setPrevFile(null) })}
      </div>
    );

    if (reconType === 'qr') return (
      <div className="upload-slots upload-slots--qr">
        {renderSlot({ id:'book', label:'All-Branches Book Report', sublabel:'All-branches consolidated ledger',
          ref:bookRef, file:bookFile, icon:'📗',
          onFile:f=>{if(validate(f))setBookFile(f);}, onClear:()=>setBookFile(null) })}
        {renderSlot({ id:'hotbook', label:'HOT Book Report', sublabel:'HOT QRHDFC book entries',
          ref:hotBookRef, file:hotBookFile, icon:'📒', accent:'qr',
          onFile:f=>{if(validate(f))setHotBookFile(f);}, onClear:()=>setHotBookFile(null) })}
        {renderSlot({ id:'stmt', label:'QR Gateway Statement', sublabel:'HDFC QR transaction report',
          ref:stmtRef, file:statFile, icon:'📲', accent:'qr',
          onFile:f=>{if(validate(f))setStatFile(f);}, onClear:()=>setStatFile(null) })}
        {renderSlot({ id:'prev', label:'Previous BRS', sublabel:'For carry-forward matching',
          ref:prevRef, file:prevBrsFile, icon:'🗂️', required:false,
          onFile:f=>{if(validate(f))setPrevFile(f);}, onClear:()=>setPrevFile(null) })}
      </div>
    );

    if (reconType === 'gateway') return (
      <div className="upload-slots upload-slots--gateway">
        {/* Row 1: Required book + statement files */}
        {renderSlot({ id:'book', label:'All-Branches Book', sublabel:'All-branches Gateway book (.xls)',
          ref:bookRef, file:bookFile, icon:'📗', accent:'gateway',
          onFile:f=>{if(validate(f))setBookFile(f);}, onClear:()=>setBookFile(null) })}
        {renderSlot({ id:'hotbook', label:'HOT Book', sublabel:'HOT Gateway book report (.xls)',
          ref:hotBookRef, file:hotBookFile, icon:'📒', accent:'gateway',
          onFile:f=>{if(validate(f))setHotBookFile(f);}, onClear:()=>setHotBookFile(null) })}
        {renderSlot({ id:'stmt', label:'YES Bank Statement', sublabel:'YES Bank statement PDF',
          ref:stmtRef, file:statFile, icon:'🏦', accent:'gateway',
          accept:'.pdf,.xlsx,.xls',
          onFile:f=>{if(validate(f,true))setStatFile(f);}, onClear:()=>setStatFile(null) })}
        {renderSlot({ id:'payu', label:'PayU Regular', sublabel:'PayU transaction report (.xlsx)',
          ref:payuRef, file:payuFile, icon:'💳', accent:'gateway',
          onFile:f=>{if(validate(f))setPayuFile(f);}, onClear:()=>setPayuFile(null) })}
        {/* Row 2: Optional gateway files */}
        {renderPayuOdSlot()}
        {renderSlot({ id:'cashfree', label:'CashFree', sublabel:'CashFree settlement report (.xlsx)',
          ref:cashfreeRef, file:cashfreeFile, icon:'💰', required:false,
          onFile:f=>{if(validate(f))setCashfree(f);}, onClear:()=>setCashfree(null) })}
        {renderSlot({ id:'easebuzz', label:'EaseBuzz', sublabel:'EaseBuzz settlement report (.csv)',
          ref:easebuzzRef, file:easebuzzFile, icon:'⚡', required:false,
          accept:'.csv,.xlsx,.xls',
          onFile:f=>{if(validate(f,true))setEasebuzz(f);}, onClear:()=>setEasebuzz(null) })}
        {renderSlot({ id:'prev', label:'Previous BRS', sublabel:'For carry-forward matching',
          ref:prevRef, file:prevBrsFile, icon:'🗂️', required:false,
          onFile:f=>{if(validate(f))setPrevFile(f);}, onClear:()=>setPrevFile(null) })}
      </div>
    );
  };

  // ── Progress indicator ────────────────────────────────────────────────────
  const progressItems = () => {
    if (!reconType) return [];
    if (reconType === 'bank') return [
      { label:'Book Report',   done:!!bookFile,    required:true  },
      { label:'Bank Statement',done:!!statFile,    required:true  },
      { label:'Previous BRS',  done:!!prevBrsFile, required:false },
    ];
    if (reconType === 'qr') return [
      { label:'All-Branches Book', done:!!bookFile,    required:true  },
      { label:'HOT Book',          done:!!hotBookFile, required:true  },
      { label:'QR Statement',      done:!!statFile,    required:true  },
      { label:'Previous BRS',      done:!!prevBrsFile, required:false },
    ];
    if (reconType === 'gateway') return [
      { label:'All-Branches Book', done:!!bookFile,    required:true  },
      { label:'HOT Book',          done:!!hotBookFile, required:true  },
      { label:'YES Bank PDF',      done:!!statFile,    required:true  },
      { label:'PayU Regular',      done:!!payuFile,    required:true  },
      { label:'PayU On-Demand',    done:payuOdFiles.length>0, required:false },
      { label:'CashFree',          done:!!cashfreeFile,required:false },
      { label:'EaseBuzz',          done:!!easebuzzFile,required:false },
      { label:'Previous BRS',      done:!!prevBrsFile, required:false },
    ];
    return [];
  };

  const TYPE_LABELS: Record<ReconType, string> = {
    bank:    '🏦 Bank Statement Reconciliation',
    qr:      '📲 QR Gateway Reconciliation',
    gateway: '🌐 Gateway YES Bank Reconciliation',
  };

  return (
    <div className="file-upload-container">
      {/* Step 1 */}
      <div className="upload-header">
        <h2>Bank Reconciliation</h2>
        <p>Start by selecting the reconciliation type, then upload your files</p>
      </div>

      <div className="type-step">
        <div className="type-step-label">
          <span className="step-badge">1</span>
          Select Reconciliation Type
        </div>

        <div className="type-cards type-cards--three">
          {/* Bank */}
          <button
            className={`type-card ${reconType === 'bank' ? 'type-card--active type-card--bank' : ''}`}
            onClick={() => handleSelectType('bank')} disabled={isLoading}>
            <span className="type-card-icon">🏦</span>
            <span className="type-card-body">
              <span className="type-card-title">Bank Reconciliation</span>
              <span className="type-card-desc">Standard bank statement — HDFC, Axis, SBI, ICICI, IndusInd, etc.</span>
              <span className="type-card-files">2 required · 1 optional</span>
            </span>
            {reconType === 'bank' && <span className="type-card-check">✓</span>}
          </button>

          {/* QR */}
          <button
            className={`type-card ${reconType === 'qr' ? 'type-card--active type-card--bank' : ''}`}
            onClick={() => handleSelectType('qr')} disabled={isLoading}>
            <span className="type-card-icon">📲</span>
            <span className="type-card-body">
              <span className="type-card-title">QR Gateway Reconciliation</span>
              <span className="type-card-desc">HDFC QR gateway transaction report — SaleSuccess UPI transactions.</span>
              <span className="type-card-files">3 required · 1 optional</span>
            </span>
            {reconType === 'qr' && <span className="type-card-check">✓</span>}
          </button>

          {/* Gateway */}
          <button
            className={`type-card ${reconType === 'gateway' ? 'type-card--active type-card--bank' : ''}`}
            onClick={() => handleSelectType('gateway')} disabled={isLoading}>
            <span className="type-card-icon">🌐</span>
            <span className="type-card-body">
              <span className="type-card-title">Gateway YES Bank</span>
              <span className="type-card-desc">PayU / CashFree / EaseBuzz settlements vs YES Bank statement.</span>
              <span className="type-card-files">4 required · 4 optional</span>
            </span>
            {reconType === 'gateway' && <span className="type-card-check">✓</span>}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      {reconType && (
        <div className="files-step">
          <div className="type-step-label">
            <span className="step-badge">2</span>
            Upload Files
            <span className="files-step-badge files-step-badge--bank">
              {TYPE_LABELS[reconType]}
            </span>
          </div>

          {renderSlots()}

          {/* Progress */}
          <div className="upload-progress">
            {progressItems().map((item, i) => (
              <div key={i} className={`progress-item ${item.done ? 'progress-item--done' : ''}`}>
                <span className="progress-dot">{item.done ? '✓' : item.required ? '○' : '◌'}</span>
                <span className="progress-label">{item.label}</span>
                {!item.required && <span className="progress-opt">optional</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((err, i) => <p key={i} className="upload-error-item">⚠ {err}</p>)}
        </div>
      )}

      {/* Submit */}
      {reconType && (
        <div className="upload-actions">
          <button onClick={handleSubmit} disabled={!canSubmit} className="btn btn-primary">
            {isLoading
              ? <><span className="spinner" />Processing…</>
              : `Run ${reconType === 'bank' ? '' : reconType === 'qr' ? 'QR ' : 'Gateway '}Reconciliation →`}
          </button>
          <button className="btn-ghost" onClick={() => { setReconType(null); setErrors([]); }} disabled={isLoading}>
            ← Change type
          </button>
        </div>
      )}

      <div className="upload-notes">
        {reconType === 'gateway' ? (
          <p>All-Branches Book, HOT Book, YES Bank PDF, and PayU Regular are required. CashFree, EaseBuzz, PayU On-Demand and Previous BRS are optional.</p>
        ) : reconType === 'qr' ? (
          <p>All-Branches Book, HOT Book, and QR Statement are required. Previous BRS enables carry-forward matching.</p>
        ) : reconType === 'bank' ? (
          <p>Book Report and Bank Statement are required. Previous BRS enables carry-forward matching from the prior period.</p>
        ) : (
          <p>Select a reconciliation type above to get started.</p>
        )}
        <p>Files are processed locally and not stored on any server.</p>
      </div>
    </div>
  );
};

export default FileUpload;