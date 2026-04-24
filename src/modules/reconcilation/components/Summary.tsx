import React from 'react';
import '../styles/Summary.css';
import '../styles/GatewayTable.css';

interface BRSData {
  book_closing_bal:   number;
  bank_closing_bal:   number;
  add_issued:         number;
  less_deposited:     number;
  less_debited_nb:    number;
  add_credited_nb:    number;
  reconciled_balance: number;
  brs_difference:     number;
}

interface GatewaySummaryItem {
  name:       string;
  gw_net:     number;
  bank_total: number;
  gross:      number;
  fees:       number;
  tax:        number;
  difference: number;
  matched:    number;
  unmatched:  number;
}

interface SummaryData {
  book_entries:      number;
  bank_entries:      number;
  matched:           number;
  matched_perfect:   number;
  matched_with_diff: number;
  book_only:         number;
  bank_only:         number;
  difference:        number;
}

interface SummaryProps {
  data:             SummaryData;
  brs?:             BRSData;
  recon_type?:      string;
  gateway_summary?: GatewaySummaryItem[];
  books_match?:     boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(Math.abs(n));

const fmtAmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const Summary: React.FC<SummaryProps> = ({
  data, brs, recon_type, gateway_summary, books_match,
}) => {
  const isGateway    = recon_type === 'gateway';
  const isReconciled = Math.abs(data.difference) < 0.01;
  const hasUnmatched = data.book_only > 0 || data.bank_only > 0;
  const matchedWithDiff = data.matched_with_diff != null
    ? data.matched_with_diff
    : Math.max(0, data.matched - data.matched_perfect);

  // ── Reconciliation accuracy score ─────────────────────────────────────────
  // Two separate signals combined:
  //
  // 1. MATCH QUALITY (70% weight):
  //    Among matched entries — what fraction are perfect vs have differences.
  //    matchQuality = perfect / (perfect + withDiff)   [100% if all perfect]
  //
  // 2. BRS RESOLUTION (30% weight):
  //    Is the BRS difference zero?
  //    brsScore = 100 if reconciled, else scales down by size of gap.
  //    Unmatched entries (book-only / bank-only) are timing items already
  //    captured in the BRS formula — they don't independently penalise score.
  //
  // This way: a fully reconciled result with carry-forwards scores high
  // (because BRS=0 drives the resolution component), while an unreconciled
  // result with lots of matched entries still scores lower.

  const totalMatched   = data.matched_perfect + matchedWithDiff;
  const matchQuality   = totalMatched > 0
    ? (data.matched_perfect / totalMatched) * 100
    : isReconciled ? 100   // no matches but reconciled = carry-forward period, not an error
    : data.book_only === 0 && data.bank_only === 0 ? 100
    : 50;

  // BRS resolution score — 100 when reconciled, scaled otherwise
  // Use entry-count ratio as a proxy for how far off we are when not reconciled
  const totalEntries   = totalMatched + data.book_only + data.bank_only;
  const unmatchedRatio = totalEntries > 0 ? (data.book_only + data.bank_only) / totalEntries : 0;
  const brsScore       = isReconciled
    ? 100
    : Math.max(0, Math.round((1 - unmatchedRatio) * 100));

  // Combined score: 70% match quality + 30% BRS resolution
  const matchPct = Math.min(100, Math.round(matchQuality * 0.70 + brsScore * 0.30));

  const statusMsg = isReconciled
    ? 'Books and bank are fully reconciled — difference is zero'
    : `BRS difference: ${fmt(data.difference)} — investigate before period close`;

  return (
    <div className="summary-container">

      {/* Status bar */}
      <div className={`status-bar ${isReconciled ? 'status-bar--ok' : 'status-bar--pending'}`}>
        <span className="status-bar__label">
          {isReconciled ? 'Fully Reconciled' : 'Reconciliation Pending'}
        </span>
        <span className="status-bar__value">{statusMsg}</span>
      </div>

      {/* Books match (gateway only) */}
      {isGateway && books_match !== undefined && (
        <div className={`status-bar ${books_match ? 'status-bar--ok' : 'status-bar--pending'}`}
          style={{ marginTop: '-12px' }}>
          <span className="status-bar__label">Books Match</span>
          <span className="status-bar__value">
            {books_match
              ? 'All-Branches HOT-HOT Payments = HOT Receipts — books are consistent'
              : 'All-Branches HOT-HOT Payments ≠ HOT Receipts — investigate book discrepancy'}
          </span>
        </div>
      )}

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-card__label">Book Entries</span>
          <span className="kpi-card__value">{data.book_entries.toLocaleString('en-IN')}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Bank Entries</span>
          <span className="kpi-card__value">{data.bank_entries.toLocaleString('en-IN')}</span>
        </div>
        <div className="kpi-card kpi-card--green">
          <span className="kpi-card__label">Matched</span>
          <span className="kpi-card__value">{data.matched.toLocaleString('en-IN')}</span>
        </div>
        <div className={`kpi-card ${data.book_only > 0 ? 'kpi-card--amber' : 'kpi-card--green'}`}>
          <span className="kpi-card__label">{isGateway ? 'DNC (Book Only)' : 'Book Only'}</span>
          <span className="kpi-card__value">{data.book_only.toLocaleString('en-IN')}</span>
        </div>
        <div className={`kpi-card ${data.bank_only > 0 ? 'kpi-card--red' : 'kpi-card--green'}`}>
          <span className="kpi-card__label">{isGateway ? 'CNB (Bank Only)' : 'Bank Only'}</span>
          <span className="kpi-card__value">{data.bank_only.toLocaleString('en-IN')}</span>
        </div>
        <div className={`kpi-card ${isReconciled ? 'kpi-card--green' : 'kpi-card--red'}`}>
          <span className="kpi-card__label">BRS Difference</span>
          <span className="kpi-card__value kpi-card__value--sm">
            {isReconciled ? '—' : fmt(data.difference)}
          </span>
        </div>
      </div>

      {/* ── Gateway per-gateway breakdown ───────────────────────────────── */}
      {isGateway && gateway_summary && gateway_summary.length > 0 && (
        <div className="summary-panel">
          <p className="panel-heading">Gateway Breakdown</p>
          <div className="gw-summary-grid">
            {gateway_summary.map((gw, i) => {
              const ok = Math.abs(gw.difference) < 1;
              return (
                <div key={i} className="gw-summary-card">
                  <div className="gw-summary-card__header">
                    <span className="gw-summary-card__name">{gw.name}</span>
                    <span className={`gw-summary-card__status ${ok ? 'gw-summary-card__status--ok' : 'gw-summary-card__status--err'}`}>
                      {ok ? 'Matched' : 'Gap'}
                    </span>
                  </div>
                  <div className="gw-summary-card__body">
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">Gross</span>
                      <span className="gw-summary-card__value">₹{fmtAmt(gw.gross)}</span>
                    </div>
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">GW Net</span>
                      <span className="gw-summary-card__value">₹{fmtAmt(gw.gw_net)}</span>
                    </div>
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">Fees</span>
                      <span className="gw-summary-card__value">₹{fmtAmt(gw.fees)}</span>
                    </div>
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">Tax</span>
                      <span className="gw-summary-card__value">₹{fmtAmt(gw.tax)}</span>
                    </div>
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">Bank Credit</span>
                      <span className="gw-summary-card__value">₹{fmtAmt(gw.bank_total)}</span>
                    </div>
                    <div className="gw-summary-card__row">
                      <span className="gw-summary-card__label">Difference</span>
                      <span className={`gw-summary-card__value ${ok ? 'gw-summary-card__diff--ok' : 'gw-summary-card__diff--err'}`}>
                        {ok ? '— (Nil)' : `₹${fmtAmt(Math.abs(gw.difference))}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BRS Balance summary */}
      {brs && (
        <div className="summary-panel">
          <p className="panel-heading">BRS Balance Summary</p>
          <table className="breakdown-table brs-balance-table">
            <tbody>
              <tr className="brs-row-opening">
                <td>Closing Balance as per Company Books</td>
                <td className="breakdown-table__val">{fmt(brs.book_closing_bal)}</td>
              </tr>
              {isGateway ? (
                <>
                  <tr>
                    <td>Add: Cheques issued but not debited in bank</td>
                    <td className="breakdown-table__val val--add">{fmt(brs.add_issued)}</td>
                  </tr>
                  <tr>
                    <td>Less: Deposited but not Credited in Bank (DNC)</td>
                    <td className="breakdown-table__val val--less">({fmt(brs.less_deposited)})</td>
                  </tr>
                  <tr>
                    <td>Less: Debited in Bank not in Book</td>
                    <td className="breakdown-table__val val--less">({fmt(brs.less_debited_nb)})</td>
                  </tr>
                  <tr>
                    <td>Add: Credited in Bank not in Book (CNB)</td>
                    <td className="breakdown-table__val val--add">{fmt(brs.add_credited_nb)}</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td>Add: Cheques issued but not debited in bank</td>
                    <td className="breakdown-table__val val--add">{fmt(brs.add_issued)}</td>
                  </tr>
                  <tr>
                    <td>Less: Cheques deposited but not credited in bank</td>
                    <td className="breakdown-table__val val--less">({fmt(brs.less_deposited)})</td>
                  </tr>
                  <tr>
                    <td>Less: Debited in bank but not recorded in book</td>
                    <td className="breakdown-table__val val--less">({fmt(brs.less_debited_nb)})</td>
                  </tr>
                  <tr>
                    <td>Add: Credited in bank but not recorded in book</td>
                    <td className="breakdown-table__val val--add">{fmt(brs.add_credited_nb)}</td>
                  </tr>
                </>
              )}
              <tr className="brs-row-subtotal">
                <td><strong>Reconciled Balance</strong></td>
                <td className="breakdown-table__val"><strong>{fmt(brs.reconciled_balance)}</strong></td>
              </tr>
              <tr className="brs-row-bank">
                <td>Closing Balance as per Bank</td>
                <td className="breakdown-table__val">{fmt(brs.bank_closing_bal)}</td>
              </tr>
              <tr className={`brs-row-diff ${isReconciled ? 'brs-row-ok' : 'brs-row-err'}`}>
                <td><strong>Difference</strong></td>
                <td className="breakdown-table__val">
                  <strong>{isReconciled ? '— (Nil)' : fmt(brs.brs_difference)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Match rate */}
      <div className="summary-panel">
        <p className="panel-heading">Reconciliation Accuracy</p>
        <div className="match-rate-row">
          <div className="match-progress">
            <div
              className={`match-progress__fill ${
                matchPct >= 95 ? 'match-progress__fill--high'
                : matchPct >= 75 ? 'match-progress__fill--mid'
                : 'match-progress__fill--low'
              }`}
              style={{ width: `${matchPct}%` }}
            />
          </div>
          <span className={`match-pct ${
            matchPct >= 95 ? 'match-pct--high'
            : matchPct >= 75 ? 'match-pct--mid'
            : 'match-pct--low'
          }`}>{matchPct}%</span>
        </div>
        <p className="match-rate-note">
          {isReconciled && matchPct === 100
            ? 'All entries matched perfectly and BRS is fully reconciled.'
            : isReconciled && matchPct >= 85
            ? 'BRS is fully reconciled. Some entries matched with minor differences.'
            : isReconciled
            ? 'BRS is fully reconciled. Review matched entries with amount differences.'
            : matchPct >= 75
            ? 'Not yet reconciled. Review unmatched and differing entries.'
            : 'Significant unmatched items remain. Investigation required before close.'}
        </p>
        <table className="breakdown-table">
          <tbody>
            <tr>
              <td>Perfect match <span className="score-weight">(weight 1.00)</span></td>
              <td className="breakdown-table__val">{data.matched_perfect.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Matched with difference <span className="score-weight">(weight 0.75)</span></td>
              <td className={`breakdown-table__val ${matchedWithDiff > 0 ? 'val--amber' : ''}`}>
                {matchedWithDiff.toLocaleString('en-IN')}
              </td>
            </tr>
            <tr>
              <td>{isGateway ? 'DNC — deposited not credited' : 'Unmatched — book only'} <span className="score-weight">(weight 0.30)</span></td>
              <td className={`breakdown-table__val ${data.book_only > 0 ? 'val--amber' : ''}`}>
                {data.book_only.toLocaleString('en-IN')}
              </td>
            </tr>
            <tr>
              <td>{isGateway ? 'CNB — credited not booked' : 'Unmatched — bank only'} <span className="score-weight">(weight 0.10)</span></td>
              <td className={`breakdown-table__val ${data.bank_only > 0 ? 'val--red' : ''}`}>
                {data.bank_only.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommended actions */}
      {(hasUnmatched || matchedWithDiff > 0 || !isReconciled) && (
        <div className="summary-panel">
          <p className="panel-heading">Recommended Actions</p>
          <ol className="next-steps">
            {data.bank_only > 0 && (
              <li className="next-step next-step--urgent">
                {isGateway
                  ? `Investigate ${data.bank_only} CNB entries — credited in bank but not recorded in book.`
                  : `Investigate ${data.bank_only} bank-only entries — present in bank statement but absent from books.`}
              </li>
            )}
            {data.book_only > 0 && (
              <li className="next-step">
                {isGateway
                  ? `Review ${data.book_only} DNC entries — deposited in books but not yet credited in bank.`
                  : `Review ${data.book_only} book-only entries — typically cheques not yet cleared.`}
              </li>
            )}
            {matchedWithDiff > 0 && (
              <li className="next-step">
                Verify {matchedWithDiff} matched {matchedWithDiff === 1 ? 'entry' : 'entries'} with
                amount differences — possible fees or data discrepancies.
              </li>
            )}
            {!isReconciled && (
              <li className="next-step">
                Resolve the BRS variance of {fmt(data.difference)} before period close.
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Summary;