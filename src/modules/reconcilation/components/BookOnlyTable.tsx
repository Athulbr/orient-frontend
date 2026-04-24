import React, { useState } from 'react';
import '../styles/DataTable.css';

interface BookOnlyRecord {
  'Txn Type': string;
  'Bill No': string;
  'Chq No': string;
  'Party': string;
  'Direction': string;
  'Sender': string;
  'Recipient': string;
  'Book Amt (Rs)': number;
  'Narration': string;
  'Issue': string;
}

interface BookOnlyTableProps {
  data: BookOnlyRecord[];
}

const BookOnlyTable: React.FC<BookOnlyTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  if (!data || data.length === 0) {
    return (
      <div className="table-empty table-empty-success">
        <p>All book entries have been matched with the bank statement.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
  const slice = data.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const fmtAmt = (v: number) =>
    Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="table-container">
      <div className="notice-bar notice-warning">
        {data.length} entries recorded in the book but not found in the bank statement.
        These are typically cheques not yet cleared or timing differences.
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Bill No</th>
              <th>Cheque No</th>
              <th>Party</th>
              <th>Direction</th>
              <th>Amount (Rs)</th>
              <th>Narration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((record, idx) => {
              const isCF = record['Issue']?.includes('Carried Forward');
              return (
                <tr key={idx} className={`data-row${isCF ? ' row-cf' : ' row-pending'}`}>
                  <td>{record['Txn Type']}</td>
                  <td className="cell-mono">{record['Bill No'] || '—'}</td>
                  <td className="cell-mono">{record['Chq No'] || '—'}</td>
                  <td className="cell-party">{record['Party']}</td>
                  <td>
                    <span className={`dir-badge dir-${record['Direction']?.toLowerCase()}`}>
                      {record['Direction']}
                    </span>
                  </td>
                  <td className="cell-amount">{fmtAmt(record['Book Amt (Rs)'])}</td>
                  <td className="cell-narration">{record['Narration'] || '—'}</td>
                  <td>
                    {isCF
                      ? <span className="badge badge-info">Carried Forward</span>
                      : <span className="badge badge-warning">Pending Clearance</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-count">
          Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, data.length)} of {data.length} records
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

export default BookOnlyTable;
