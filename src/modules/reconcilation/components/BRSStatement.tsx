import React, { useState } from 'react';
import '../styles/BRSStatement.css';

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

interface BRSItem {
  date?:      string;
  txn_type?:  string;
  bill_no?:   string;
  chq_no?:    string;
  party?:     string;
  amount:     number;
  narration?: string;
  is_cf?:     boolean;
}

interface BRSStatementProps {
  brs:           BRSData;
  book_only:     any[];
  bank_only:     any[];
  matched?:      any[];          // ← new: for discrepancies section
  company_name?: string;
  account_info?: string;
  brs_date?:     string;
}

const fmtAmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ── Discrepancy helpers ───────────────────────────────────────────────────────
const isDiscrepancy = (row: any): boolean => {
  const nameMatch  = row['Name Match']   || '';
  const amtMatch   = row['Amount Match'] || '';
  const isPartial  = row['Partial Payment'] === true || row['Partial Payment'] === 'YES — verify';
  return (
    nameMatch === 'Mismatch' ||
    nameMatch === 'Partial'  ||
    String(amtMatch).startsWith('Diff') ||
    isPartial
  );
};

const discrepancyType = (row: any): 'name-mismatch' | 'partial' | 'amount' | 'name-partial' => {
  const nameMatch = row['Name Match'] || '';
  const amtMatch  = row['Amount Match'] || '';
  const isPartial = row['Partial Payment'] === true || row['Partial Payment'] === 'YES — verify';
  if (nameMatch === 'Mismatch')                    return 'name-mismatch';
  if (isPartial)                                   return 'partial';
  if (String(amtMatch).startsWith('Diff'))         return 'amount';
  return 'name-partial';
};

const BRSStatement: React.FC<BRSStatementProps> = ({
  brs, book_only, bank_only, matched = [],
  company_name = '',
  account_info = '',
  brs_date     = '',
}) => {
  const isReconciled = Math.abs(brs.brs_difference) < 0.01;
  const [discExpanded, setDiscExpanded] = useState(true);

  // ── Four BRS sections ───────────────────────────────────────────────────────
  const issued     = book_only.filter(r => r['Direction'] === 'OUTFLOW');
  const deposited  = book_only.filter(r => r['Direction'] === 'INFLOW');
  const debitedNB  = bank_only.filter(r => r['Direction'] === 'OUTFLOW');
  const creditedNB = bank_only.filter(r => r['Direction'] === 'INFLOW');

  // ── Map raw rows to BRSItem ─────────────────────────────────────────────────
  const mapBook = (r: any): BRSItem => ({
    date:      r['Date']          || '',
    txn_type:  r['Txn Type']      || '',
    bill_no:   r['Bill No']       || '',
    chq_no:    r['Chq No']        || '',
    party:     r['Party']         || '',
    amount:    Number(r['Book Amt (Rs)']) || 0,
    narration: (r['Narration'] || '')
      .replace('[CF from prev BRS]', '')
      .trim()
      .replace(/\s*\|\s*$/, ''),
    is_cf: String(r['Narration'] || '').includes('[CF from prev BRS]'),
  });

  const mapBank = (r: any): BRSItem => ({
    date:      r['Date']          || '',
    chq_no:    r['Chq No']        || '',
    party:     r['Party']         || r['Description'] || '',
    amount:    Number(r['Bank Amt (Rs)']) || 0,
    narration: r['Description']   || '',
    is_cf:     Number(r['Balance (Rs)']) === 0,
  });

  // ── Running balance steps ───────────────────────────────────────────────────
  const step1 = brs.book_closing_bal + brs.add_issued;
  const step2 = step1 - brs.less_deposited;
  const step3 = step2 - brs.less_debited_nb;

  // ── Discrepancies ───────────────────────────────────────────────────────────
  const discrepancies = matched.filter(isDiscrepancy);
  const nPartial  = discrepancies.filter(r => discrepancyType(r) === 'partial').length;
  const nMismatch = discrepancies.filter(r => discrepancyType(r) === 'name-mismatch').length;
  const nAmtDiff  = discrepancies.filter(r => discrepancyType(r) === 'amount').length;
  const nNamePart = discrepancies.filter(r => discrepancyType(r) === 'name-partial').length;
  const typeParts: string[] = [];
  if (nMismatch) typeParts.push(`${nMismatch} name mismatch${nMismatch > 1 ? 'es' : ''}`);
  if (nNamePart) typeParts.push(`${nNamePart} partial name match${nNamePart > 1 ? 'es' : ''}`);
  if (nPartial)  typeParts.push(`${nPartial} partial payment${nPartial > 1 ? 's' : ''}`);
  if (nAmtDiff)  typeParts.push(`${nAmtDiff} amount difference${nAmtDiff > 1 ? 's' : ''}`);

  // Build a concise flag text for each discrepancy row
  const buildFlagText = (row: any): string => {
    const flags: string[] = [];
    const nameMatch = row['Name Match']   || '';
    const amtMatch  = row['Amount Match'] || '';
    const score     = row['Fuzzy Score %'] ?? '';
    const bookParty = row['Book Party']   || '';
    const bankParty = row['Bank Party']   || '';
    const diff      = row['Difference (Rs)'] ?? 0;
    const bookAmt   = row['Book Amt (Rs)']   ?? 0;
    const bankAmt   = row['Bank Amt (Rs)']   ?? 0;
    const isPartial = row['Partial Payment'] === true || row['Partial Payment'] === 'YES — verify';
    const rawFlags  = row['Flags'] || '';

    if (isPartial) {
      const seg = String(rawFlags).split(' | ').find(s =>
        s.startsWith('PARTIAL PAYMENT') || s.startsWith('SPLIT PAYMENT'));
      if (seg) flags.push(seg);
    }
    if (nameMatch === 'Mismatch') {
      flags.push(`NAME MISMATCH (score ${score}%): Book='${bookParty}' vs Bank='${bankParty}' — Verify party identity before clearance`);
    } else if (nameMatch === 'Partial') {
      flags.push(`PARTIAL NAME MATCH (score ${score}%): Book='${bookParty}' vs Bank='${bankParty}' — Confirm same party`);
    }
    if (String(amtMatch).startsWith('Diff')) {
      flags.push(`AMOUNT DIFFERENCE: Rs${Number(diff) >= 0 ? '+' : ''}${fmtAmt(Math.abs(diff))} — Book ₹${fmtAmt(bookAmt)} vs Bank ₹${fmtAmt(bankAmt)}`);
    }
    // Extra flags (date gap, direction, etc.) from raw Flags field
    String(rawFlags).split(' | ').forEach(seg => {
      if (
        seg &&
        !seg.startsWith('PARTIAL PAYMENT') &&
        !seg.startsWith('SPLIT PAYMENT') &&
        !seg.startsWith('NAME MISMATCH') &&
        !seg.startsWith('PARTIAL NAME') &&
        !seg.startsWith('AMOUNT DIFFERENCE') &&
        !seg.startsWith('Name ')
      ) {
        flags.push(seg);
      }
    });
    return [...new Set(flags.filter(Boolean))].join(' | ');
  };

  // ── Section component ───────────────────────────────────────────────────────
  const Section: React.FC<{
    title:    string;
    sign:     'add' | 'less';
    items:    BRSItem[];
    subtotal: number;
    running:  number;
  }> = ({ title, sign, items, subtotal, running }) => (
    <div className="brs-section">
      <div className={`brs-section-title brs-section-title--${sign}`}>
        <span className="brs-sign-badge">{sign === 'add' ? 'Add' : 'Less'}</span>
        {title}
      </div>

      <div className="brs-col-header">
        <span>Date</span>
        <span>Type</span>
        <span>Bill No</span>
        <span>Chq No</span>
        <span>Party / Description</span>
        <span className="col-right">Amount (Rs)</span>
        <span className="col-right">Narration</span>
      </div>

      {items.length === 0 ? (
        <div className="brs-nil-row">— Nil —</div>
      ) : (
        items.map((item, i) => (
          <div key={i} className={`brs-item-row${item.is_cf ? ' brs-item-row--cf' : ''}`}>
            <span className="brs-cell brs-cell--mono brs-cell--date">{item.date || ''}</span>
            <span className="brs-cell brs-cell--type">{item.txn_type || ''}</span>
            <span className="brs-cell brs-cell--mono">{item.bill_no || ''}</span>
            <span className="brs-cell brs-cell--mono">{item.chq_no || ''}</span>
            <span className="brs-cell brs-cell--party">
              {item.party}
              {item.is_cf && <span className="brs-cf-badge">CF</span>}
            </span>
            <span className="brs-cell brs-cell--amt">{fmtAmt(item.amount)}</span>
            <span className="brs-cell brs-cell--narr">{item.narration || ''}</span>
          </div>
        ))
      )}

      <div className="brs-subtotal-row">
        <span className={`brs-subtotal-amt brs-subtotal-amt--${sign}`}>{fmtAmt(subtotal)}</span>
      </div>
      <div className="brs-running-row">
        <span>Running Balance</span>
        <span className="brs-running-amt">{fmtAmt(running)}</span>
      </div>
    </div>
  );

  // ── Discrepancy row colour class ────────────────────────────────────────────
  const discRowClass = (row: any) => {
    const t = discrepancyType(row);
    if (t === 'name-mismatch') return 'disc-row disc-row--mismatch';
    if (t === 'partial')       return 'disc-row disc-row--partial';
    if (t === 'amount')        return 'disc-row disc-row--amount';
    return 'disc-row disc-row--name-partial';
  };

  return (
    <div className="brs-statement">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="brs-header">
        {company_name && <div className="brs-header-company">{company_name}</div>}
        {account_info && <div className="brs-header-account">{account_info}</div>}
        <div className="brs-header-title">
          Bank Reconciliation Statement
          {brs_date && <span className="brs-header-date"> As On {brs_date}</span>}
        </div>
      </div>

      {/* ── Opening balance ─────────────────────────────────────────────────── */}
      <div className="brs-opening-row">
        <span className="brs-opening-label">Closing Balance as per Company Books</span>
        <span className="brs-opening-amt">{fmtAmt(brs.book_closing_bal)}</span>
      </div>

      {/* ── Four BRS sections ───────────────────────────────────────────────── */}
      <Section
        title="Cheques issued but not debited in Bank"
        sign="add"
        items={issued.map(mapBook)}
        subtotal={brs.add_issued}
        running={step1}
      />
      <Section
        title="Cheques deposited but not credited in Bank"
        sign="less"
        items={deposited.map(mapBook)}
        subtotal={brs.less_deposited}
        running={step2}
      />
      <Section
        title="Debited in Bank but not credited in Our Book"
        sign="less"
        items={debitedNB.map(mapBank)}
        subtotal={brs.less_debited_nb}
        running={step3}
      />
      <Section
        title="Credited in Bank but not debited in Our Book"
        sign="add"
        items={creditedNB.map(mapBank)}
        subtotal={brs.add_credited_nb}
        running={brs.reconciled_balance}
      />

      {/* ── Bank closing balance ─────────────────────────────────────────────── */}
      <div className="brs-bank-row">
        <span>Closing Balance as per Bank</span>
        <span>{fmtAmt(brs.bank_closing_bal)}</span>
      </div>

      {/* ── Difference ──────────────────────────────────────────────────────── */}
      <div className={`brs-diff-row ${isReconciled ? 'brs-diff-row--ok' : 'brs-diff-row--err'}`}>
        <span>
          {isReconciled
            ? 'Difference  —  Fully Reconciled'
            : 'Difference  —  Investigate'}
        </span>
        <span>{isReconciled ? '—' : fmtAmt(brs.brs_difference)}</span>
      </div>

      {/* ── Matched Transactions with Discrepancies ──────────────────────────── */}
      {discrepancies.length > 0 && (
        <div className="brs-disc-section">
          {/* Section header — collapsible */}
          <button
            className="brs-disc-header"
            onClick={() => setDiscExpanded(e => !e)}
            aria-expanded={discExpanded}
          >
            <span className="brs-disc-header__title">
              Matched Transactions with Discrepancies — Requires Verification
            </span>
            <span className="brs-disc-header__meta">
              {discrepancies.length} item{discrepancies.length > 1 ? 's' : ''}
              {typeParts.length > 0 && ` · ${typeParts.join(', ')}`}
            </span>
            <span className="brs-disc-header__chevron">{discExpanded ? '▲' : '▼'}</span>
          </button>

          {discExpanded && (
            <>
              {/* Column headers */}
              <div className="brs-disc-col-header">
                <span>Book Date</span>
                <span>Book Party</span>
                <span>Book Chq</span>
                <span className="col-right">Book Amt (Rs)</span>
                <span>Bank Date</span>
                <span>Bank Party</span>
                <span className="col-right">Bank Amt (Rs)</span>
                <span>Flags / Action Required</span>
              </div>

              {discrepancies.map((row, i) => {
                const t = discrepancyType(row);
                return (
                  <div key={i} className={discRowClass(row)}>
                    <span className="disc-cell disc-cell--mono">{row['Book Date'] || ''}</span>
                    <span className="disc-cell disc-cell--party">{row['Book Party'] || ''}</span>
                    <span className="disc-cell disc-cell--mono">{row['Book Chq'] || ''}</span>
                    <span className="disc-cell disc-cell--amt">{fmtAmt(Number(row['Book Amt (Rs)']) || 0)}</span>
                    <span className="disc-cell disc-cell--mono">{row['Bank Date'] || ''}</span>
                    <span className="disc-cell disc-cell--party">{row['Bank Party'] || ''}</span>
                    <span className="disc-cell disc-cell--amt">{fmtAmt(Number(row['Bank Amt (Rs)']) || 0)}</span>
                    <span className="disc-cell disc-cell--flag">
                      <span className={`disc-type-badge disc-type-badge--${t}`}>
                        {t === 'name-mismatch'  ? 'Name Mismatch'   :
                         t === 'name-partial'   ? 'Partial Name'    :
                         t === 'partial'        ? 'Partial Payment' :
                                                  'Amt Diff'}
                      </span>
                      {buildFlagText(row)}
                    </span>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="brs-disc-legend">
                <span className="legend-item legend-item--mismatch">🔴 Name Mismatch — verify party before sign-off</span>
                <span className="legend-item legend-item--partial">🟠 Partial/Split Payment — confirm all parts recorded</span>
                <span className="legend-item legend-item--amount">🟡 Amount Difference — review and confirm</span>
                <span className="legend-item legend-item--name-partial">🔵 Partial Name — confirm same party</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CF footnote ─────────────────────────────────────────────────────── */}
      <div className="brs-footnote">
        <span className="brs-cf-badge">CF</span>
        Carried Forward from Previous BRS — outstanding items not yet cleared in bank
      </div>

    </div>
  );
};

export default BRSStatement;