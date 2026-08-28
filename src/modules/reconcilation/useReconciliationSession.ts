import { useCallback, useMemo, useState } from 'react';
import type { MatchedRecord, BookOnlyRecord, BankOnlyRecord, BRSData, SummaryData } from './types';

// ── ID stamping ───────────────────────────────────────────────────────────
// The backend doesn't send row IDs. We stamp one onto every record the
// moment a response arrives, and every record created afterwards (by
// un-match / confirm-match) gets one too. Nothing downstream — table
// selection, the action handlers, the regenerate request — ever relies on
// array index, so rows stay identifiable as they move between tables.
let _idCounter = 0;
function genId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

export function stampIds<T extends object>(records: T[], prefix: string): (T & { _id: string })[] {
  return records.map(r => ({ ...r, _id: genId(prefix) }));
}

// ── BRS recalculation ────────────────────────────────────────────────────
// Mirrors app.py's _compute_brs() exactly: opening/closing balances are
// fixed (not user-editable), only the four outstanding-item buckets —
// derived from whatever is currently in book_only / bank_only — change as
// the user edits. This is what makes BRS Statement update itself the
// instant an un-match or confirm-match happens, with no server round trip.
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function computeBRS(bookClosingBal: number, bankClosingBal: number, bookOnly: BookOnlyRecord[], bankOnly: BankOnlyRecord[]): BRSData {
  const addIssued     = bookOnly.filter(r => r['Direction'] === 'OUTFLOW').reduce((s, r) => s + toNum(r['Book Amt (Rs)']), 0);
  const lessDeposited = bookOnly.filter(r => r['Direction'] === 'INFLOW').reduce((s, r) => s + toNum(r['Book Amt (Rs)']), 0);
  const lessDebitedNb = bankOnly.filter(r => r['Direction'] === 'OUTFLOW').reduce((s, r) => s + toNum(r['Bank Amt (Rs)']), 0);
  const addCreditedNb = bankOnly.filter(r => r['Direction'] === 'INFLOW').reduce((s, r) => s + toNum(r['Bank Amt (Rs)']), 0);
  const running = bookClosingBal + addIssued - lessDeposited - lessDebitedNb + addCreditedNb;
  return {
    book_closing_bal:   round2(bookClosingBal),
    bank_closing_bal:   round2(bankClosingBal),
    add_issued:         round2(addIssued),
    less_deposited:     round2(lessDeposited),
    less_debited_nb:    round2(lessDebitedNb),
    add_credited_nb:    round2(addCreditedNb),
    reconciled_balance: round2(running),
    brs_difference:     round2(bankClosingBal - running),
  };
}

// ── Un-match: split one Matched row back into its Book Only + Bank Only halves ──
function splitMatchedRow(m: MatchedRecord, reason: string): { book: BookOnlyRecord; bank: BankOnlyRecord } {
  const note = reason ? `Un-matched by user: ${reason}` : 'Un-matched by user';
  const book: BookOnlyRecord = {
    _id: genId('book'),
    'Date':          m['Book Date'],
    'Txn Type':      m['Book Txn'],
    'Bill No':       m['Book Bill No'],
    'Chq No':        m['Book Chq'],
    'Party':         m['Book Party'],
    'Party Raw':     m['Book Party Raw'] ?? m['Book Party'],
    'Direction':     m['Book Direction'],
    'Sender':        m['Book Sender'],
    'Recipient':     m['Book Recipient'],
    'Book Amt (Rs)': toNum(m['Book Amt (Rs)']),
    'Narration':     note,
    'Issue':         note,
    'Is CF':         false,
    'Is Manual':     true,
  };
  const bank: BankOnlyRecord = {
    _id: genId('bank'),
    'Date':          m['Bank Date'],
    'Chq No':        m['Bank Chq'] || m['Bank RRN'] || '',
    'Description':   m['Bank Description'],
    'Party':         m['Bank Party'],
    'Direction':     m['Bank Direction'],
    'Sender':        m['Bank Sender'],
    'Recipient':     m['Bank Recipient'],
    'Debit (Rs)':    m['Debit (Rs)'],
    'Credit (Rs)':   m['Credit (Rs)'],
    'Bank Amt (Rs)': toNum(m['Bank Amt (Rs)']),
    'Narration':     note,
    'Issue':         note,
    'Is CF':         false,
    'Is Manual':     true,
  };
  return { book, bank };
}

// ── Confirm Match: merge Book Only row(s) + Bank Only row(s) into Matched row(s) ──
// Exactly one side may be a "split" (length > 1) at a time — the caller
// guarantees this (see the guarded selection setters below), so this only
// has to handle three shapes: 1:1, 1 book:N banks, or N books:1 bank. The
// split side gets one Matched row per leg — the first leg carries the real
// difference and the combined amount notation, later legs are flagged
// "Split part i/N" with a zeroed difference — mirroring the same
// _display_book_amt / _display_difference pattern reconcilation.py already
// uses for its own automated split-clear detection, just usable from
// either direction here.
function buildManualMatchRows(bookRows: BookOnlyRecord[], bankRows: BankOnlyRecord[], reason: string): MatchedRecord[] {
  const totalBookAmt = bookRows.reduce((s, r) => s + toNum(r['Book Amt (Rs)']), 0);
  const totalBankAmt = bankRows.reduce((s, r) => s + toNum(r['Bank Amt (Rs)']), 0);
  const diff        = round2(totalBankAmt - totalBookAmt);
  const isBookSplit = bookRows.length > 1;
  const isBankSplit = bankRows.length > 1;
  const isSplit     = isBookSplit || isBankSplit;
  const legCount    = Math.max(bookRows.length, bankRows.length);
  const note = reason ? `Manually confirmed by user: ${reason}` : 'Manually confirmed by user';

  const rows: MatchedRecord[] = [];
  for (let i = 0; i < legCount; i++) {
    const isFirst = i === 0;
    const book    = isBookSplit ? bookRows[i] : bookRows[0];
    const bank    = isBankSplit ? bankRows[i] : bankRows[0];
    const bookAmt = isBookSplit ? toNum(book['Book Amt (Rs)']) : totalBookAmt;
    const bankAmt = isBankSplit ? toNum(bank['Bank Amt (Rs)']) : totalBankAmt;

    const amountMatch = isSplit && !isFirst
      ? `Split part ${i + 1}/${legCount}`
      : Math.abs(diff) < 0.01
        ? 'Exact'
        : `Diff Rs${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;

    rows.push({
      _id: genId('matched'),
      'Match Method':     'Manual Match (User)',
      'Name Match':       'Manual',
      'Fuzzy Score %':    0,
      'Amount Match':     amountMatch,
      'Book Date':        book['Date'] ?? '',
      'Book Txn':         book['Txn Type'] ?? '',
      'Book Bill No':     book['Bill No'],
      'Book Chq':         book['Chq No'],
      'Book Party':       book['Party'],
      'Book Party Raw':   book['Party Raw'] ?? book['Party'],
      'Book Direction':   book['Direction'],
      'Book Sender':      book['Sender'] ?? book['Party'],
      'Book Recipient':   book['Recipient'] ?? '',
      'Book Amt (Rs)':    bookAmt,
      'Bank Date':        bank['Date'],
      'Bank Chq':         bank['Chq No'],
      'Bank Description': bank['Description'] ?? bank['Bank Statement'] ?? '',
      'Bank Party':       bank['Party'],
      'Bank Direction':   bank['Direction'],
      'Bank Sender':      bank['Sender'] ?? bank['Party'],
      'Bank Recipient':   bank['Recipient'] ?? '',
      'Debit (Rs)':       bank['Debit (Rs)'] ?? '',
      'Credit (Rs)':      bank['Credit (Rs)'] ?? '',
      'Bank Amt (Rs)':    bankAmt,
      'Difference (Rs)':  isFirst ? diff : 0,
      'Flags':            [note, isSplit ? `Split payment — ${legCount} ${isBookSplit ? 'book' : 'bank'} rows` : ''].filter(Boolean).join(' | '),
      'Partial Payment':  isSplit,
      'Bank Full Amt':    totalBankAmt,
      'Is Manual':        true,
      // Whichever side is NOT split repeats its full amount on every leg
      // (so each row still displays sensibly on its own) — these overrides
      // blank that repeat on legs after the first, so the downloaded
      // workbook's Matched sheet and Summary totals don't count it once
      // per leg. The split side's own values are already genuinely
      // different per row, so it needs no override.
      ...(isBankSplit ? {} : {
        '_display_bank_amt': isFirst ? bankAmt : '',
        '_display_debit':    isFirst ? (bank['Debit (Rs)'] ?? '') : '',
        '_display_credit':   isFirst ? (bank['Credit (Rs)'] ?? '') : '',
      }),
      ...(isBookSplit ? {} : (isBankSplit ? { '_display_book_amt': isFirst ? bookAmt : '' } : {})),
    });
  }
  return rows;
}

// ── The hook ─────────────────────────────────────────────────────────────
export interface ReconciliationSessionInit {
  matched:   MatchedRecord[];
  book_only: BookOnlyRecord[];
  bank_only: BankOnlyRecord[];
  brs?:      BRSData;
  // Raw file row counts from the original run — these describe the input
  // files, not the matching outcome, so they stay fixed regardless of
  // later un-match / confirm-match edits.
  book_entries?: number;
  bank_entries?: number;
}

export function useReconciliationSession(init: ReconciliationSessionInit) {
  const [matched,   setMatched]   = useState<MatchedRecord[]>(() => stampIds(init.matched, 'matched'));
  const [bookOnly,  setBookOnly]  = useState<BookOnlyRecord[]>(() => stampIds(init.book_only, 'book'));
  const [bankOnly,  setBankOnly]  = useState<BankOnlyRecord[]>(() => stampIds(init.bank_only, 'bank'));
  const [isDirty,   setIsDirty]   = useState(false);

  // Fixed opening/closing balances from the original run — never recomputed
  // client-side, only the outstanding-item buckets around them change.
  const bookClosingBal = init.brs?.book_closing_bal ?? 0;
  const bankClosingBal = init.brs?.bank_closing_bal ?? 0;

  // Selection state lives here (not inside each table) so it survives
  // switching tabs — picking a Book Only row, then a Bank Only row on a
  // different tab, still lets Confirm Match see both. Book Only and Bank
  // Only are both multi-select (checkboxes), for split payments from
  // either direction — but only one side may ever have more than one item
  // selected at once (no true many-to-many); the guarded setters below
  // silently reject a change that would violate that, from any entry
  // point (a table's checkbox, or Human Verification's own checkboxes).
  const [selectedMatchedIds, setSelectedMatchedIds]     = useState<Set<string>>(new Set());
  const [selectedBookOnlyIds, setSelectedBookOnlyIdsRaw] = useState<Set<string>>(new Set());
  const [selectedBankOnlyIds, setSelectedBankOnlyIdsRaw] = useState<Set<string>>(new Set());

  const setSelectedBookOnlyIds = useCallback((next: Set<string>) => {
    if (next.size > 1 && selectedBankOnlyIds.size > 1) return; // would be many-to-many — reject
    setSelectedBookOnlyIdsRaw(next);
  }, [selectedBankOnlyIds]);

  const setSelectedBankOnlyIds = useCallback((next: Set<string>) => {
    if (next.size > 1 && selectedBookOnlyIds.size > 1) return; // would be many-to-many — reject
    setSelectedBankOnlyIdsRaw(next);
  }, [selectedBookOnlyIds]);

  const toggleMatchedSelection = useCallback((id: string) => {
    setSelectedMatchedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleBookOnlySelection = useCallback((id: string) => {
    const next = new Set(selectedBookOnlyIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedBookOnlyIds(next);
  }, [selectedBookOnlyIds, setSelectedBookOnlyIds]);

  const toggleBankOnlySelection = useCallback((id: string) => {
    const next = new Set(selectedBankOnlyIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedBankOnlyIds(next);
  }, [selectedBankOnlyIds, setSelectedBankOnlyIds]);

  const clearSelections = useCallback(() => {
    setSelectedMatchedIds(new Set());
    setSelectedBookOnlyIdsRaw(new Set());
    setSelectedBankOnlyIdsRaw(new Set());
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────
  // Each setter below is called exactly once with a plain (non-function)
  // value, reading the other pieces of state directly from the closure.
  // Deliberately NOT nesting one setState call's updater inside another's —
  // React 18 StrictMode can invoke updater functions twice to surface
  // side effects, which would silently duplicate the newly-created rows.
  const unmatchRows = useCallback((matchedIds: string[], reason: string) => {
    if (matchedIds.length === 0) return;
    const idSet = new Set(matchedIds);
    const toSplit = matched.filter(r => idSet.has(r._id));
    if (toSplit.length === 0) return;

    const newBooks: BookOnlyRecord[] = [];
    const newBanks: BankOnlyRecord[] = [];
    for (const m of toSplit) {
      const { book, bank } = splitMatchedRow(m, reason);
      newBooks.push(book);
      newBanks.push(bank);
    }

    setMatched(prev => prev.filter(r => !idSet.has(r._id)));
    setBookOnly(prev => [...newBooks, ...prev]);
    setBankOnly(prev => [...newBanks, ...prev]);
    setIsDirty(true);
    clearSelections();
  }, [matched, clearSelections]);

  const confirmMatch = useCallback((bookIds: string[], bankIds: string[], reason: string) => {
    if (bookIds.length === 0 || bankIds.length === 0) return;
    if (bookIds.length > 1 && bankIds.length > 1) return; // no true many-to-many
    const bookIdSet = new Set(bookIds);
    const bankIdSet = new Set(bankIds);
    const bookRows = bookOnly.filter(r => bookIdSet.has(r._id));
    const bankRows = bankOnly.filter(r => bankIdSet.has(r._id));
    if (bookRows.length === 0 || bankRows.length === 0) return;

    const newRows = buildManualMatchRows(bookRows, bankRows, reason);

    setBookOnly(prev => prev.filter(r => !bookIdSet.has(r._id)));
    setBankOnly(prev => prev.filter(r => !bankIdSet.has(r._id)));
    setMatched(prev => [...newRows, ...prev]);
    setIsDirty(true);
    clearSelections();
  }, [bookOnly, bankOnly, clearSelections]);

  const approveFlagged = useCallback((matchedId: string) => {
    setMatched(prev => prev.map(r => (r._id === matchedId ? { ...r, 'Is Reviewed': true } : r)));
    setIsDirty(true);
  }, []);

  // ── Derived BRS + Summary — recompute on every edit, no server call ─────
  const brs = useMemo<BRSData>(
    () => computeBRS(bookClosingBal, bankClosingBal, bookOnly, bankOnly),
    [bookClosingBal, bankClosingBal, bookOnly, bankOnly],
  );

  const summary = useMemo<SummaryData>(() => {
    const matchedPerfect  = matched.filter(r => r['Name Match'] === 'Match' && r['Amount Match'] === 'Exact').length;
    const matchedWithDiff = matched.filter(r => r['Amount Match'] !== 'Exact').length;
    return {
      book_entries:      init.book_entries ?? (matched.length + bookOnly.length),
      bank_entries:      init.bank_entries ?? (matched.length + bankOnly.length),
      matched:           matched.length,
      matched_perfect:   matchedPerfect,
      matched_with_diff: matchedWithDiff,
      book_only:         bookOnly.length,
      bank_only:         bankOnly.length,
      difference:        Math.abs(brs.brs_difference) < 0.01 ? 0 : brs.brs_difference,
    };
  }, [matched, bookOnly, bankOnly, brs.brs_difference, init.book_entries, init.bank_entries]);

  return {
    matched, bookOnly, bankOnly, brs, summary, isDirty,
    selectedMatchedIds, selectedBookOnlyIds, selectedBankOnlyIds,
    setSelectedMatchedIds, setSelectedBookOnlyIds, setSelectedBankOnlyIds,
    toggleMatchedSelection, toggleBookOnlySelection, toggleBankOnlySelection, clearSelections,
    unmatchRows, confirmMatch, approveFlagged,
  };
}

export type ReconciliationSession = ReturnType<typeof useReconciliationSession>;
