import React, { useState } from 'react';
import ResultsTabs from './ResultsTabs';
import Summary from './Summary';
import MatchedTable from './MatchedTable';
import BookOnlyTable from './BookOnlyTable';
import BankOnlyTable from './BankOnlyTable';
import BRSStatement from './BRSStatement';
import GatewayMatchedTable from './GatewayMatchedTable';
import styles from '../styles/Results.module.css';

interface SheetMetadata {
  [sheetName: string]: {
    rows: number;
    columns: number;
    column_names: string[];
  };
}

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

interface ResultsData {
  matched:   any[];
  book_only: any[];
  bank_only: any[];
  brs?:      BRSData;
  summary: {
    book_entries:      number;
    bank_entries:      number;
    matched:           number;
    matched_perfect:   number;
    matched_with_diff: number;
    book_only:         number;
    bank_only:         number;
    difference:        number;
  };
  download_url:        string;
  book_file_name:      string;
  statement_file_name: string;
  book_sheets:         SheetMetadata;
  statement_sheets:    SheetMetadata;
  company_name?:  string;
  account_info?:  string;
  brs_date?:      string;
  recon_type?:    string;
  // gateway-specific
  gateway_summary?: GatewaySummaryItem[];
  books_match?:     boolean;
  reconciled?:      boolean;
}

interface ResultsProps {
  data:           ResultsData;
  onDownload:     () => void;
  isDownloading?: boolean;
}

const Results: React.FC<ResultsProps> = ({ data, onDownload, isDownloading }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const isGateway = data.recon_type === 'gateway';
  const hasBRS    = !!data.brs;

  const tabs = [
    { id: 'summary',   label: 'Summary',       count: undefined,              alert: false },
    { id: 'matched',   label: isGateway ? 'Gateway Matched' : 'Matched',
                                                count: data.summary.matched,   alert: false },
    { id: 'book-only', label: isGateway ? 'DNC (Book Only)' : 'Book Only',
                                                count: data.summary.book_only, alert: data.summary.book_only > 0 },
    { id: 'bank-only', label: isGateway ? 'CNB (Bank Only)' : 'Bank Only',
                                                count: data.summary.bank_only, alert: data.summary.bank_only > 0 },
    { id: 'brs', label: 'BRS Statement', count: undefined, alert: false },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <Summary
            data={data.summary}
            brs={data.brs}
            recon_type={data.recon_type}
            gateway_summary={data.gateway_summary}
            books_match={data.books_match}
          />
        );

      case 'matched':
        if (isGateway) {
          return <GatewayMatchedTable data={data.matched} />;
        }
        return <MatchedTable data={data.matched} />;

      case 'book-only':
        return <BookOnlyTable data={data.book_only} />;

      case 'bank-only':
        return <BankOnlyTable data={data.bank_only} />;

      case 'brs':
        if (!hasBRS) {
          return (
            <div className={styles['brs-unavailable']}>
              <p>BRS data not available. Please re-run reconciliation with all three files.</p>
            </div>
          );
        }
        return (
          <BRSStatement
            brs={data.brs!}
            book_only={data.book_only}
            bank_only={data.bank_only}
            matched={data.matched}
            company_name={data.company_name}
            account_info={data.account_info}
            brs_date={data.brs_date}
          />
        );

      default:
        return null;
    }
  };


  return (
    <div className={styles['results-container']}>
      {/* Entry count + download — compact bar above tabs */}
      <div className={styles['results-meta-bar']}>
        <span className={styles['results-entry-count']}>
          {data.summary.book_entries} book {data.summary.book_entries === 1 ? 'entry' : 'entries'} vs{' '}
          {data.summary.bank_entries} bank {data.summary.bank_entries === 1 ? 'entry' : 'entries'}
        </span>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className={`${styles['btn']} ${styles['btn-download']}`}
        >
          {isDownloading ? (
            <><span className={styles['spinner-small']} /> Downloading...</>
          ) : (
            'Download Report'
          )}
        </button>
      </div>

      <ResultsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </ResultsTabs>
    </div>
  );
};

export default Results;
