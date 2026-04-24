import React, { useState } from 'react';
import styles from '../styles/DataTable.module.css';
import { cx } from '../utils/cx';

interface BankOnlyRecord {
  'Date': string;
  'Chq No': string;
  'Description': string;
  'Party': string;
  'Direction': string;
  'Sender': string;
  'Recipient': string;
  'Debit (Rs)': string | number;
  'Credit (Rs)': string | number;
  'Bank Amt (Rs)': number;
  'Issue': string;
}

interface BankOnlyTableProps {
  data: BankOnlyRecord[];
}

const BankOnlyTable: React.FC<BankOnlyTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  if (!data || data.length === 0) {
    return (
      <div className={cx(styles['table-empty'], styles['table-empty-success'])}>
        <p>All bank entries have been matched with book records.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
  const slice = data.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const fmtAmt = (v: string | number) => {
    const n = Number(v);
    return isNaN(n) || !v ? '—' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={styles['table-container']}>
      <div className={cx(styles['notice-bar'], styles['notice-danger'])}>
        <strong>{data.length} transactions</strong> found in the bank statement with no corresponding book entry.
        These must be investigated and recorded immediately.
      </div>

      <div className={styles['table-scroll']}>
        <table className={styles['data-table']}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Cheque No</th>
              <th>Description</th>
              <th>Party</th>
              <th>Direction</th>
              <th>Debit (Rs)</th>
              <th>Credit (Rs)</th>
              <th>Amount (Rs)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((record, idx) => {
              const isCF = record['Issue']?.includes('Carried Forward');
              return (
                <tr
                  key={idx}
                  className={cx(
                    styles['data-row'],
                    isCF ? styles['row-cf'] : styles['row-unrecorded'],
                  )}
                >
                  <td className={styles['cell-mono']}>{record['Date']}</td>
                  <td className={styles['cell-mono']}>{record['Chq No'] || '—'}</td>
                  <td className={styles['cell-description']}>{record['Description']}</td>
                  <td className={styles['cell-party']}>{record['Party']}</td>
                  <td>
                    <span className={cx(styles['dir-badge'], styles[`dir-${record['Direction']?.toLowerCase()}`])}>
                      {record['Direction']}
                    </span>
                  </td>
                  <td className={cx(styles['cell-amount'], styles['cell-debit'])}>{fmtAmt(record['Debit (Rs)'])}</td>
                  <td className={cx(styles['cell-amount'], styles['cell-credit'])}>{fmtAmt(record['Credit (Rs)'])}</td>
                  <td className={cx(styles['cell-amount'], styles['cell-amount-bold'])}>{fmtAmt(record['Bank Amt (Rs)'])}</td>
                  <td>
                    {isCF
                      ? <span className={cx(styles['badge'], styles['badge-info'])}>Carried Forward</span>
                      : <span className={cx(styles['badge'], styles['badge-danger'])}>Unrecorded</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles['table-footer']}>
        <span className={styles['table-count']}>
          Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, data.length)} of {data.length} records
        </span>
        {totalPages > 1 && (
          <div className={styles['pagination']}>
            <button className={styles['page-btn']} disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span className={styles['page-info']}>Page {page + 1} of {totalPages}</span>
            <button className={styles['page-btn']} disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankOnlyTable;
