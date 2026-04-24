import React, { useState } from 'react';
import '../styles/DataTable.css';

interface MatchedRecord {
  'Match Method': string;
  'Name Match': string;
  'Fuzzy Score %': number;
  'Amount Match': string;
  'Book Txn': string;
  'Book Bill No': string;
  'Book Chq': string;
  'Book Party': string;
  'Book Direction': string;
  'Book Sender': string;
  'Book Recipient': string;
  'Book Amt (Rs)': number;
  'Bank Date': string;
  'Bank Chq': string;
  'Bank RRN'?: string;
  'Bank Description': string;
  'Bank Payer'?: string;
  'Bank Party': string;
  'Bank Direction': string;
  'Bank Sender': string;
  'Bank Recipient': string;
  'Debit (Rs)': string | number;
  'Credit (Rs)': string | number;
  'Bank Amt (Rs)': number;
  'Difference (Rs)': number;
  'Flags': string;
}

interface MatchedTableProps {
  data: MatchedRecord[];
}

const nameMatchVariant = (v: string): string => {
  if (v === 'Match')    return 'badge-success';
  if (v === 'Partial')  return 'badge-warning';
  return 'badge-danger';
};

const amtMatchVariant = (v: string | undefined): string => {
  if (!v)                      return 'badge-warning';
  if (v === 'Exact')           return 'badge-success';
  if (v.includes('Minor') || v.startsWith('Split')) return 'badge-warning';
  return 'badge-danger';
};

const MatchedTable: React.FC<MatchedTableProps> = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>No matched records found</p>
        <p className="subtitle">Matched entries will appear here after reconciliation</p>
      </div>
    );
  }

  const filtered = data.filter((r) => {
    if (filter === 'all')       return true;
    if (filter === 'perfect')   return r['Name Match'] === 'Match';
    if (filter === 'partial')   return r['Name Match'] === 'Partial';
    if (filter === 'mismatch')  return r['Name Match'] === 'Mismatch';
    if (filter === 'flagged')   return r['Flags'] && r['Flags'].trim().length > 0;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const counts = {
    all: data.length,
    perfect:  data.filter(r => r['Name Match'] === 'Match').length,
    partial:  data.filter(r => r['Name Match'] === 'Partial').length,
    mismatch: data.filter(r => r['Name Match'] === 'Mismatch').length,
    flagged:  data.filter(r => r['Flags'] && r['Flags'].trim().length > 0).length,
  };

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setPage(0);
    setExpandedRow(null);
  };

  const fmtAmt = (v: number) =>
    Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="table-container">
      {/* Filter bar */}
      <div className="filter-bar">
        {[
          { key: 'all',      label: `All (${counts.all})` },
          { key: 'perfect',  label: `Perfect Match (${counts.perfect})` },
          { key: 'partial',  label: `Partial Match (${counts.partial})` },
          { key: 'mismatch', label: `Mismatch (${counts.mismatch})` },
          { key: 'flagged',  label: `Flagged (${counts.flagged})` },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => handleFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-expand" />
              <th>Method</th>
              <th>Name Match</th>
              <th>Score</th>
              <th>Amount Match</th>
              <th>Direction</th>
              <th>Book Party</th>
              <th>Book Amount</th>
              <th>Bank Amount</th>
              <th>Difference</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((record, idx) => {
              const globalIdx = page * PER_PAGE + idx;
              const isExpanded = expandedRow === globalIdx;
              const diff = record['Difference (Rs)'];
              const hasFlags = record['Flags'] && record['Flags'].trim().length > 0;

              return (
                <React.Fragment key={globalIdx}>
                  <tr
                    className={`data-row${isExpanded ? ' row-expanded' : ''}${hasFlags ? ' row-flagged' : ''}`}
                    onClick={() => setExpandedRow(isExpanded ? null : globalIdx)}
                  >
                    <td className="col-expand">
                      <button className="expand-btn" tabIndex={-1}>
                        {isExpanded ? '▾' : '▸'}
                      </button>
                    </td>
                    <td className="cell-method">{record['Match Method']}</td>
                    <td>
                      <span className={`badge ${nameMatchVariant(record['Name Match'])}`}>
                        {record['Name Match']}
                      </span>
                    </td>
                    <td className="cell-score">{record['Fuzzy Score %']}%</td>
                    <td>
                      <span className={`badge ${amtMatchVariant(record['Amount Match'])}`}>
                        {/* {record['Amount Match'] === 'Exact' ? 'Exact' : record['Amount Match'].substring(0, 18)} */}
                        {record['Amount Match'] === 'Exact' ? 'Exact' : (record['Amount Match'] ?? '').substring(0, 18)}
                      </span>
                    </td>
                    <td>
                      <span className={`dir-badge dir-${record['Book Direction']?.toLowerCase()}`}>
                        {record['Book Direction']}
                      </span>
                    </td>
                    <td className="cell-party">{record['Book Party']}</td>
                    <td className="cell-amount">{fmtAmt(record['Book Amt (Rs)'])}</td>
                    <td className="cell-amount">{fmtAmt(record['Bank Amt (Rs)'])}</td>
                    <td className={`cell-amount ${Math.abs(diff) < 0.01 ? 'diff-zero' : 'diff-nonzero'}`}>
                      {Math.abs(diff) < 0.01 ? '—' : Number(diff).toLocaleString('en-IN', { minimumFractionDigits: 2, signDisplay: 'always' })}
                    </td>
                    <td className="cell-flags">
                      {hasFlags ? <span className="flag-tag">Review</span> : null}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan={11}>
                        <div className="expanded-details">
                          <div className="detail-panel">
                            <div className="detail-panel-title">Book Entry</div>
                            {([
                              ['Transaction Type', record['Book Txn']],
                              ['Bill No', record['Book Bill No'] || '—'],
                              ['Cheque No', record['Book Chq'] || '—'],
                              ['Party', record['Book Party']],
                              ['Direction', record['Book Direction']],
                              ['Sender', record['Book Sender']],
                              ['Recipient', record['Book Recipient']],
                              ['Amount', fmtAmt(record['Book Amt (Rs)'])],
                            ] as [string, string][]).map(([label, value]) => (
                              <div className="detail-row" key={label}>
                                <span className="detail-label">{label}</span>
                                <span className="detail-value">{value}</span>
                              </div>
                            ))}
                          </div>

                          <div className="detail-panel">
                            <div className="detail-panel-title">Bank Entry</div>
                            {([
                              ['Date', record['Bank Date']],
                              // ['Cheque No', record['Bank Chq'] || '—'],
                              // ['Description', record['Bank Description']],
                              ['Cheque No / RRN', record['Bank Chq'] ?? record['Bank RRN'] ?? '—'],
                              ['Description / Payer', record['Bank Description'] ?? record['Bank Payer'] ?? '—'],
                              ['Party', record['Bank Party']],
                              ['Direction', record['Bank Direction']],
                              ['Sender', record['Bank Sender']],
                              ['Recipient', record['Bank Recipient']],
                              ['Debit', record['Debit (Rs)'] ? fmtAmt(Number(record['Debit (Rs)'])) : '—'],
                              ['Credit', record['Credit (Rs)'] ? fmtAmt(Number(record['Credit (Rs)'])) : '—'],
                            ] as [string, string][]).map(([label, value]) => (
                              <div className="detail-row" key={label}>
                                <span className="detail-label">{label}</span>
                                <span className="detail-value">{value}</span>
                              </div>
                            ))}
                          </div>

                          {hasFlags && (
                            <div className="detail-panel detail-panel-flags">
                              <div className="detail-panel-title">Review Notes</div>
                              {record['Flags'].split('|').map((flag, i) => (
                                <div key={i} className="flag-note">{flag.trim()}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-count">
          Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length} records
        </span>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => { setPage(p => p - 1); setExpandedRow(null); }}
            >
              Previous
            </button>
            <span className="page-info">Page {page + 1} of {totalPages}</span>
            <button
              className="page-btn"
              disabled={page === totalPages - 1}
              onClick={() => { setPage(p => p + 1); setExpandedRow(null); }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedTable;
