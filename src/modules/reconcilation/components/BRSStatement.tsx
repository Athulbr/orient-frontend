import React, { useState } from 'react';
import styles from '../styles/BRSStatement.module.css';
import { cx } from '../utils/cx';

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
  date?:          string;
  txn_type?:      string;
  bill_no?:       string;
  chq_no?:        string;
  book_report?:   string;   // raw name from Book Report column
  bank_statement?: string;  // raw description from Bank Statement column
  party?:         string;   // Makez Extracted
  amount:         number;
  narration?:     string;
  is_cf?:         boolean;
}

interface BRSStatementProps {
  brs:           BRSData;
  book_only:     any[];
  bank_only:     any[];
  matched?:      any[];
  company_name?: string;
  account_info?: string;
  brs_date?:     string;
  recon_type?:   string;
}

const fmtAmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ── Discrepancy helpers ────────────────────────────────────────────────────────
const isDiscrepancy = (row: any): boolean => {
  const nameMatch  = row['Name Match']   || '';
  const amtMatch   = row['Amount Match'] || '';
  const flags      = row['Flags']        || '';
  const isPartial  = row['Partial Payment'] === true || row['Partial Payment'] === 'YES — verify';
  // Also catch low-name-match rows (QR) which have flags like "Name 89% — verify" or "⚠ Low name"
  const hasNameFlag = String(flags).includes('— verify') || String(flags).includes('Low name') || String(flags).includes('manual check');
  return (
    nameMatch === 'Mismatch' ||
    nameMatch === 'Partial'  ||
    String(amtMatch).startsWith('Diff') ||
    isPartial ||
    hasNameFlag
  );
};

const discrepancyType = (row: any): 'name-mismatch' | 'partial' | 'amount' | 'name-partial' | 'low-name' => {
  const nameMatch = row['Name Match'] || '';
  const amtMatch  = row['Amount Match'] || '';
  const flags     = row['Flags'] || '';
  const isPartial = row['Partial Payment'] === true || row['Partial Payment'] === 'YES — verify';
  const isLowName = String(flags).includes('Low name') || String(flags).includes('manual check');
  const isNameVerify = String(flags).includes('— verify');
  if (nameMatch === 'Mismatch')               return 'name-mismatch';
  if (isPartial)                              return 'partial';
  if (String(amtMatch).startsWith('Diff'))    return 'amount';
  if (isLowName)                              return 'low-name';
  if (isNameVerify)                           return 'name-partial';
  return 'name-partial';
};

const BRSStatement: React.FC<BRSStatementProps> = ({
  brs, book_only, bank_only, matched = [],
  company_name = '',
  account_info = '',
  brs_date     = '',
  recon_type   = '',
}) => {
  const isReconciled = Math.abs(brs.brs_difference) < 0.01;
  const [discExpanded, setDiscExpanded] = useState(true);

  // ── Four BRS sections ────────────────────────────────────────────────────────
  const issued     = book_only.filter(r => r['Direction'] === 'OUTFLOW');
  const deposited  = book_only.filter(r => r['Direction'] === 'INFLOW');
  const debitedNB  = bank_only.filter(r => r['Direction'] === 'OUTFLOW');
  const creditedNB = bank_only.filter(r => r['Direction'] === 'INFLOW');

  // ── Map raw rows to BRSItem ──────────────────────────────────────────────────
  const mapBook = (r: any): BRSItem => {
    // Narration comes clean from backend for QR/gateway; for bank strip [CF from prev BRS] marker
    const rawNarr = r['Narration'] || '';
    const cleanNarr = rawNarr.replace('[CF from prev BRS]', '').trim().replace(/\s*\|\s*$/, '');
    const isPartyName = cleanNarr.startsWith('INDIVI - ')
      || cleanNarr === (r['Party Raw'] || '').trim()
      || cleanNarr === (r['Party'] || '').trim();
    const narration = (cleanNarr && !isPartyName) ? cleanNarr : (r['Issue'] || '');
    return {
      date:           r['Date']           || '',
      txn_type:       r['Txn Type']       || '',
      bill_no:        r['Bill No']        || '',
      chq_no:         r['Chq No'] != null ? String(r['Chq No']) : '',
      book_report:    r['Book Report']    || r['Party Raw'] || r['Party'] || '',
      bank_statement: r['Bank Statement'] || '',   // blank for book-only entries
      party:          r['Party']          || '',   // Makez Extracted
      amount:         Number(r['Book Amt (Rs)']) || 0,
      narration,
      is_cf: rawNarr.includes('[CF from prev BRS]') || String(r['Issue'] || '').includes('Carried Forward') || !!r['Is CF'],
    };
  };

  const isQR = recon_type === 'qr';

  const mapBank = (r: any): BRSItem => ({
    date:           r['Date']           || '',
    txn_type:       r['Txn Type']       || '',
    bill_no:        r['Bill No']        || '',
    chq_no:         r['RRN'] || r['Chq No'] || '',  // RRN for QR, Chq No for bank, blank for gateway
    book_report:    r['Book Report']    || '',        // always blank for bank-side entries
    bank_statement: r['Bank Statement'] || r['Description'] || r['Party'] || '',
    party:          r['Party']          || '',        // Makez Extracted
    amount:         Number(r['Bank Amt (Rs)']) || 0,
    narration:      r['Narration']      || r['Issue'] || '',
    is_cf:          String(r['Issue'] || '').includes('Carried Forward') || !!r['Is CF'],
  });

  // ── Running balance steps ────────────────────────────────────────────────────
  const step1 = brs.book_closing_bal + brs.add_issued;
  const step2 = step1 - brs.less_deposited;
  const step3 = step2 - brs.less_debited_nb;

  // ── Discrepancies ────────────────────────────────────────────────────────────
  const discrepancies = matched.filter(isDiscrepancy);
  const nPartial   = discrepancies.filter(r => discrepancyType(r) === 'partial').length;
  const nMismatch  = discrepancies.filter(r => discrepancyType(r) === 'name-mismatch').length;
  const nAmtDiff   = discrepancies.filter(r => discrepancyType(r) === 'amount').length;
  const nNamePart  = discrepancies.filter(r => discrepancyType(r) === 'name-partial').length;
  const nLowName   = discrepancies.filter(r => discrepancyType(r) === 'low-name').length;
  const typeParts: string[] = [];
  if (nMismatch) typeParts.push(`${nMismatch} name mismatch${nMismatch > 1 ? 'es' : ''}`);
  if (nLowName)  typeParts.push(`${nLowName} low name match${nLowName > 1 ? 'es' : ''}`);
  if (nNamePart) typeParts.push(`${nNamePart} partial name match${nNamePart > 1 ? 'es' : ''}`);
  if (nPartial)  typeParts.push(`${nPartial} partial payment${nPartial > 1 ? 's' : ''}`);
  if (nAmtDiff)  typeParts.push(`${nAmtDiff} amount difference${nAmtDiff > 1 ? 's' : ''}`);

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

  // ── Section component ────────────────────────────────────────────────────────
  const Section: React.FC<{
    title:     string;
    sign:      'add' | 'less';
    items:     BRSItem[];
    subtotal:  number;
    running:   number;
    sourceCol: 'book' | 'bank';   // which raw-name column to show
  }> = ({ title, sign, items, subtotal, running, sourceCol }) => (
    <div className={styles['brs-section']}>
      <div className={cx(styles['brs-section-title'], styles[`brs-section-title--${sign}`])}>
        <span className={styles['brs-sign-badge']}>{sign === 'add' ? 'Add' : 'Less'}</span>
        {title}
      </div>

      <div className={styles['brs-scroll-wrap']}>
        <div className={sourceCol === 'book' ? styles['brs-col-header--book'] : styles['brs-col-header--bank']}>
          <span>Date</span>
          <span>Type</span>
          <span>Bill No</span>
          <span>{sourceCol === 'book' ? 'Chq No' : isQR ? 'RRN' : 'Chq No'}</span>
          {sourceCol === 'book'
            ? <span>Book Report</span>
            : <span>Bank Statement</span>
          }
          <span>Makez Extracted</span>
          <span className={styles['col-right']}>Amount (Rs)</span>
          <span>Narration</span>
        </div>

        {items.length === 0 ? (
          <div className={styles['brs-nil-row']}>— Nil —</div>
        ) : (
          items.map((item, i) => (
            <div key={i} className={cx(
              sourceCol === 'book' ? styles['brs-item-row--book'] : styles['brs-item-row--bank'],
              item.is_cf && styles['brs-item-row--cf']
            )}>
              <span className={cx(styles['brs-cell'], styles['brs-cell--mono'])}>{item.date || ''}</span>
              <span className={styles['brs-cell']}>{item.txn_type || ''}</span>
              <span className={cx(styles['brs-cell'], styles['brs-cell--mono'])}>{item.bill_no || ''}</span>
              <span className={cx(styles['brs-cell'], styles['brs-cell--mono'])}>{item.chq_no || ''}</span>
              {sourceCol === 'book'
                ? <span className={cx(styles['brs-cell'], styles['brs-cell--book'])}>{item.book_report || ''}</span>
                : <span className={cx(styles['brs-cell'], styles['brs-cell--bank'])}>{item.bank_statement || ''}</span>
              }
              <span className={cx(styles['brs-cell'], styles['brs-cell--party'])}>
                <span className={styles['brs-cell--party-text']}>{item.party}</span>
                {item.is_cf && <span className={styles['brs-cf-badge']}>CF</span>}
              </span>
              <span className={cx(styles['brs-cell'], styles['brs-cell--amt'])}>{fmtAmt(item.amount)}</span>
              <span className={cx(styles['brs-cell'], styles['brs-cell--narr'])}>{item.narration || ''}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles['brs-subtotal-row']}>
        <span className={cx(styles['brs-subtotal-amt'], styles[`brs-subtotal-amt--${sign}`])}>
          {fmtAmt(subtotal)}
        </span>
      </div>
      <div className={styles['brs-running-row']}>
        <span>Running Balance</span>
        <span className={styles['brs-running-amt']}>{fmtAmt(running)}</span>
      </div>
    </div>
  );

  // ── Discrepancy row colour class ─────────────────────────────────────────────
  const discRowClass = (row: any): string => {
    const t = discrepancyType(row);
    return cx(
      styles['disc-row'],
      t === 'name-mismatch' && styles['disc-row--mismatch'],
      t === 'partial'       && styles['disc-row--partial'],
      t === 'amount'        && styles['disc-row--amount'],
      t === 'low-name'      && styles['disc-row--mismatch'],   // reuse red styling
      t === 'name-partial'  && styles['disc-row--name-partial'],
    );
  };

  return (
    <div className={styles['brs-statement']}>

      {/* Header */}
      <div className={styles['brs-header']}>
        {company_name && <div className={styles['brs-header-company']}>{company_name}</div>}
        {account_info && <div className={styles['brs-header-account']}>{account_info}</div>}
        <div className={styles['brs-header-title']}>
          Bank Reconciliation Statement
          {brs_date && <span className={styles['brs-header-date']}> As On {brs_date}</span>}
        </div>
      </div>

      {/* Opening balance */}
      <div className={styles['brs-opening-row']}>
        <span className={styles['brs-opening-label']}>Closing Balance as per Company Books</span>
        <span className={styles['brs-opening-amt']}>{fmtAmt(brs.book_closing_bal)}</span>
      </div>

      {/* Four BRS sections */}
      <Section
        title="Cheques issued but not debited in Bank"
        sign="add"
        items={issued.map(mapBook)}
        subtotal={brs.add_issued}
        running={step1}
        sourceCol="book"
      />
      <Section
        title="Cheques deposited but not credited in Bank"
        sign="less"
        items={deposited.map(mapBook)}
        subtotal={brs.less_deposited}
        running={step2}
        sourceCol="book"
      />
      <Section
        title="Debited in Bank but not credited in Our Book"
        sign="less"
        items={debitedNB.map(mapBank)}
        subtotal={brs.less_debited_nb}
        running={step3}
        sourceCol="bank"
      />
      <Section
        title="Credited in Bank but not debited in Our Book"
        sign="add"
        items={creditedNB.map(mapBank)}
        subtotal={brs.add_credited_nb}
        running={brs.reconciled_balance}
        sourceCol="bank"
      />

      {/* Bank closing balance */}
      <div className={styles['brs-bank-row']}>
        <span>Closing Balance as per Bank</span>
        <span>{fmtAmt(brs.bank_closing_bal)}</span>
      </div>

      {/* Difference */}
      <div className={cx(styles['brs-diff-row'], isReconciled ? styles['brs-diff-row--ok'] : styles['brs-diff-row--err'])}>
        <span>
          {isReconciled ? 'Difference  —  Fully Reconciled' : 'Difference  —  Investigate'}
        </span>
        <span>{isReconciled ? '—' : fmtAmt(brs.brs_difference)}</span>
      </div>

      {/* Matched Transactions with Discrepancies */}
      {discrepancies.length > 0 && (
        <div className={styles['brs-disc-section']}>
          <button
            className={styles['brs-disc-header']}
            onClick={() => setDiscExpanded(e => !e)}
            aria-expanded={discExpanded}
          >
            <span className={styles['brs-disc-header__title']}>
              Matched Transactions with Discrepancies — Requires Verification
            </span>
            <span className={styles['brs-disc-header__meta']}>
              {discrepancies.length} item{discrepancies.length > 1 ? 's' : ''}
              {typeParts.length > 0 && ` · ${typeParts.join(', ')}`}
            </span>
            <span className={styles['brs-disc-header__chevron']}>{discExpanded ? 'Hide' : 'Show'}</span>
          </button>

          {discExpanded && (
            <>
              <div className={styles['brs-disc-col-header']}>
                <span>Book Date</span>
                <span>Book Party</span>
                <span>Book Chq</span>
                <span className={styles['col-right']}>Book Amt (Rs)</span>
                <span>Bank Date</span>
                <span>Bank Party</span>
                <span className={styles['col-right']}>Bank Amt (Rs)</span>
                <span>Flags / Action Required</span>
                <span>Book Report</span>
                <span>Bank Statement</span>
              </div>

              {discrepancies.map((row, i) => {
                const t = discrepancyType(row);
                return (
                  <div key={i} className={discRowClass(row)}>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--mono'])}>{row['Book Date'] || ''}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--party'])}>{row['Book Party'] || ''}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--mono'])}>{row['Book Chq'] || ''}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--amt'])}>{fmtAmt(Number(row['Book Amt (Rs)']) || 0)}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--mono'])}>{row['Bank Date'] || ''}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--party'])}>{row['Bank Party'] || ''}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--amt'])}>{fmtAmt(Number(row['Bank Amt (Rs)']) || 0)}</span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--flag'])}>
                      <span className={cx(styles['disc-type-badge'], styles[`disc-type-badge--${t}`])}>
                        {t === 'name-mismatch'  ? 'Name Mismatch'   :
                         t === 'name-partial'   ? 'Partial Name'    :
                         t === 'partial'        ? 'Partial Payment' :
                         t === 'low-name'       ? '⚠ Low Name'      :
                                                  'Amt Diff'}
                      </span>
                      {buildFlagText(row)}
                    </span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--rawname'])}>
                      {row['Book Party Raw'] || row['Book Party'] || ''}
                    </span>
                    <span className={cx(styles['disc-cell'], styles['disc-cell--rawname'])}>
                      {row['Bank Description'] || row['Bank Party'] || ''}
                    </span>
                  </div>
                );
              })}

              {/* Legend */}
              <div className={styles['brs-disc-legend']}>
                <span className={cx(styles['legend-item'], styles['legend-item--mismatch'])}>Name Mismatch — verify party before sign-off</span>
                <span className={cx(styles['legend-item'], styles['legend-item--mismatch'])}>⚠ Low Name — manual check required (&lt;60% match)</span>
                <span className={cx(styles['legend-item'], styles['legend-item--partial'])}>Partial/Split Payment — confirm all parts recorded</span>
                <span className={cx(styles['legend-item'], styles['legend-item--amount'])}>Amount Difference — review and confirm</span>
                <span className={cx(styles['legend-item'], styles['legend-item--name-partial'])}>Partial Name — confirm same party</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* CF footnote */}
      <div className={styles['brs-footnote']}>
        <span className={styles['brs-cf-badge']}>CF</span>
        Carried Forward from Previous BRS — outstanding items not yet cleared in bank
      </div>

    </div>
  );
};

export default BRSStatement;