import React, { useState } from 'react';
import '../styles/DataTable.css';
import '../styles/GatewayTable.css';

interface GatewayMatchedRecord {
  'Match Method': string;
  'Name Match': string;
  'Amount Match': string;
  'Book Party': string;
  'Book Amt (Rs)': number;
  'Bank Party': string;
  'Bank Amt (Rs)': number;
  'Difference (Rs)': number;
  'Flags': string;
  'Gateway': string;
  'UTR': string;
  'Gross': number;
  'Fees': number;
  'Tax': number;
  'Credit Type': string;
}

interface GatewayMatchedTableProps {
  data: GatewayMatchedRecord[];
}

const GatewayMatchedTable: React.FC<GatewayMatchedTableProps> = ({ data }) => {
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage]     = useState(0);
  const PER_PAGE = 25;

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>No gateway matched records found</p>
        <p className="subtitle">Matched gateway UTR entries will appear here after reconciliation</p>
      </div>
    );
  }

  const GW_COLORS: Record<string, string> = {
    'PayU Regular':   '#dbeafe',
    'PayU-Regular':   '#dbeafe',
    'PayU On-Demand': '#d0e4f2',
    'PayU-OnDemand':  '#d0e4f2',
    'CashFree':       '#d1fae5',
    'EaseBuzz':       '#ead1dc',
  };

  const gateways = Array.from(new Set(data.map(r => r['Gateway'] || r['Match Method'])));
  const counts: Record<string, number> = {
    all:     data.length,
    match:   data.filter(r => r['Name Match'] === 'Match').length,
    mismatch:data.filter(r => r['Name Match'] !== 'Match').length,
    ...Object.fromEntries(gateways.map(g => [g, data.filter(r => (r['Gateway'] || r['Match Method']) === g).length])),
  };

  const filtered = data.filter(r => {
    if (filter === 'all')      return true;
    if (filter === 'match')    return r['Name Match'] === 'Match';
    if (filter === 'mismatch') return r['Name Match'] !== 'Match';
    return (r['Gateway'] || r['Match Method']) === filter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice      = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const fmtAmt = (v: number) =>
    Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleFilter = (f: string) => { setFilter(f); setPage(0); };

  // Group totals for header
  const gwTotals = gateways.map(g => ({
    name:    g,
    count:   data.filter(r => (r['Gateway'] || r['Match Method']) === g).length,
    net:     data.filter(r => (r['Gateway'] || r['Match Method']) === g)
               .reduce((s, r) => s + (r['Book Amt (Rs)'] || 0), 0),
    bank:    data.filter(r => (r['Gateway'] || r['Match Method']) === g)
               .reduce((s, r) => s + (r['Bank Amt (Rs)'] || 0), 0),
  }));

  return (
    <div className="table-container">
      {/* Gateway totals strip */}
      <div className="gw-totals-strip">
        {gwTotals.map(gw => (
          <div key={gw.name} className="gw-total-card"
            style={{ borderLeftColor: GW_COLORS[gw.name] || '#e5e7eb' }}>
            <span className="gw-total-name">{gw.name}</span>
            <span className="gw-total-count">{gw.count} UTRs</span>
            <span className="gw-total-amt">Net ₹{fmtAmt(gw.net)}</span>
            <span className={`gw-total-diff ${Math.abs(gw.net - gw.bank) < 1 ? 'gw-ok' : 'gw-err'}`}>
              {Math.abs(gw.net - gw.bank) < 1 ? '✓ Match' : `Diff ₹${fmtAmt(Math.abs(gw.net - gw.bank))}`}
            </span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {[
          { key:'all',      label:`All (${counts.all})` },
          { key:'match',    label:`Match (${counts.match})` },
          { key:'mismatch', label:`Mismatch (${counts.mismatch})` },
          ...gateways.map(g => ({ key:g, label:`${g} (${counts[g] || 0})` })),
        ].map(f => (
          <button key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => handleFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gateway</th>
              <th>UTR / Reference</th>
              <th>Credit Type</th>
              <th>GW Net (Rs)</th>
              <th>Gross (Rs)</th>
              <th>Fees (Rs)</th>
              <th>Tax (Rs)</th>
              <th>Bank Credit (Rs)</th>
              <th>Diff (Rs)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((record, idx) => {
              const gwName  = record['Gateway'] || record['Match Method'];
              const gwColor = GW_COLORS[gwName] || '#ffffff';
              const isMatch = record['Name Match'] === 'Match';
              const diff    = record['Difference (Rs)'];
              return (
                <tr key={idx}
                  className={`data-row ${isMatch ? 'row-pending' : 'row-unrecorded'}`}
                  style={{ '--gw-color': gwColor } as React.CSSProperties}>
                  <td>
                    <span className="gw-badge" style={{ background: gwColor }}>
                      {gwName}
                    </span>
                  </td>
                  <td className="cell-mono gw-utr">{record['UTR'] || record['Bank Party']}</td>
                  <td className="cell-method">{record['Credit Type']}</td>
                  <td className="cell-amount">{fmtAmt(record['Book Amt (Rs)'])}</td>
                  <td className="cell-amount">{fmtAmt(record['Gross'] || 0)}</td>
                  <td className="cell-amount gw-fees">{fmtAmt(record['Fees'] || 0)}</td>
                  <td className="cell-amount gw-tax">{fmtAmt(record['Tax'] || 0)}</td>
                  <td className="cell-amount">{fmtAmt(record['Bank Amt (Rs)'])}</td>
                  <td className={`cell-amount ${Math.abs(diff) < 1 ? 'diff-zero' : 'diff-nonzero'}`}>
                    {Math.abs(diff) < 1 ? '—' : Number(diff).toLocaleString('en-IN', { minimumFractionDigits: 2, signDisplay: 'always' })}
                  </td>
                  <td>
                    <span className={`badge ${isMatch ? 'badge-success' : 'badge-danger'}`}>
                      {isMatch ? 'Match' : record['Flags'] || 'Mismatch'}
                    </span>
                  </td>
                </tr>
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
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span className="page-info">Page {page + 1} of {totalPages}</span>
            <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatewayMatchedTable;