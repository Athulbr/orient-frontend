import { useState } from 'react';
import FileUpload from './components/FileUpload';
import type { ReconType } from './components/FileUpload';
import Results from './components/Results';
import styles from './app.module.css';

interface SheetMetadata {
    [sheetName: string]: {
        rows: number;
        columns: number;
        column_names: string[];
    };
}

interface BRSData {
    book_closing_bal: number;
    bank_closing_bal: number;
    add_issued: number;
    less_deposited: number;
    less_debited_nb: number;
    add_credited_nb: number;
    reconciled_balance: number;
    brs_difference: number;
}

interface GatewaySummaryItem {
    name: string;
    gw_net: number;
    bank_total: number;
    gross: number;
    fees: number;
    tax: number;
    difference: number;
    matched: number;
    unmatched: number;
}

interface ReconciliationResult {
    matched: any[];
    book_only: any[];
    bank_only: any[];

    recon_type?: string;
    brs?: BRSData;
    company_name?: string;
    account_info?: string;
    brs_date?: string;

    // gateway-specific
    gateway_summary?: GatewaySummaryItem[];
    books_match?: boolean;
    reconciled?: boolean;

    summary: {
        book_entries: number;
        bank_entries: number;
        matched: number;
        matched_perfect: number;
        matched_with_diff: number;
        book_only: number;
        bank_only: number;
        difference: number;
    };
    download_url: string;
    book_file_name: string;
    statement_file_name: string;
    book_sheets: SheetMetadata;
    statement_sheets: SheetMetadata;
}

function ListReconcilationPage() {
    const [stage, setStage] = useState<'upload' | 'results'>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDL] = useState(false);
    const [results, setResults] = useState<ReconciliationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = 'http://localhost:8000';

    const handleUpload = async (
        bookFile: File,
        statementFile: File,
        prevBrsFile: File | null,
        reconType: ReconType,
        hotBookFile?: File | null,
        payuOdFiles?: File[],
        cashfreeFile?: File | null,
        easebuzzFile?: File | null
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            if (reconType === 'gateway') {
                // Gateway endpoint
                formData.append('all_branches_file', bookFile);
                formData.append('hot_book_file', hotBookFile!);
                formData.append('statement_file', statementFile);
                formData.append('payu_file', hotBookFile!); // hotBookFile slot reused for payu in gateway
                // NOTE: In gateway mode, the FileUpload passes:
                //   bookFile     = all_branches_file
                //   hotBookFile  = hot_book_file
                //   statementFile = statement_file (PDF)
                // payuFile is passed separately via the gateway-specific slot
                // We need to reconstruct this — see below
            } else if (reconType === 'qr') {
                formData.append('all_branches_file', bookFile);
                formData.append('hot_book_file', hotBookFile!);
                formData.append('statement_file', statementFile);
                if (prevBrsFile) {
                    formData.append('previous_brs_file', prevBrsFile);
                } else {
                    formData.append(
                        'previous_brs_file',
                        new File([], 'placeholder.xlsx', {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        })
                    );
                }
            } else {
                formData.append('book_file', bookFile);
                formData.append('statement_file', statementFile);
                if (prevBrsFile) {
                    formData.append('previous_brs_file', prevBrsFile);
                } else {
                    formData.append(
                        'previous_brs_file',
                        new File([], 'placeholder.xlsx', {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        })
                    );
                }
            }

            let endpoint = '/reconcile';
            if (reconType === 'qr') endpoint = '/reconcile-qr';
            if (reconType === 'gateway') endpoint = '/reconcile-gateway';

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.detail || `Server error: ${response.statusText}`);
            }

            const data = await response.json();

            const hex = data.file_bytes as string;
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
                bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
            }
            const blob = new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            setResults({
                matched: data.matched || [],
                book_only: data.book_only || [],
                bank_only: data.bank_only || [],

                recon_type: data.recon_type || reconType,
                brs: data.brs || null,
                company_name: data.company_name || '',
                account_info: data.account_info || '',
                brs_date: data.brs_date || '',

                // gateway-specific
                gateway_summary: data.gateway_summary || [],
                books_match: data.books_match,
                reconciled: data.reconciled,

                summary: data.summary || {
                    book_entries: 0,
                    bank_entries: 0,
                    matched: 0,
                    matched_perfect: 0,
                    matched_with_diff: 0,
                    book_only: 0,
                    bank_only: 0,
                    difference: 0
                },

                download_url: URL.createObjectURL(blob),
                book_file_name: data.book_file_name || data.all_branches_file || '',
                statement_file_name: data.statement_file_name || '',
                book_sheets: data.book_sheets || data.all_branches_sheets || {},
                statement_sheets: data.statement_sheets || {}
            });

            setStage('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Separate gateway upload handler that receives the full gateway-specific params
    const handleGatewayUpload = async (
        allBranchesFile: File,
        hotBookFile: File,
        statementFile: File,
        payuFile: File,
        prevBrsFile: File | null,
        payuOdFiles: File[],
        cashfreeFile: File | null,
        easebuzzFile: File | null
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('all_branches_file', allBranchesFile);
            formData.append('hot_book_file', hotBookFile);
            formData.append('statement_file', statementFile);
            formData.append('payu_file', payuFile);

            for (const f of payuOdFiles) {
                formData.append('payu_od_files', f);
            }
            if (cashfreeFile) formData.append('cashfree_file', cashfreeFile);
            if (easebuzzFile) formData.append('easebuzz_file', easebuzzFile);
            if (prevBrsFile) formData.append('previous_brs_file', prevBrsFile);

            const response = await fetch(`${API_BASE_URL}/reconcile-gateway`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.detail || `Server error: ${response.statusText}`);
            }

            const data = await response.json();

            const hex = data.file_bytes as string;
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
                bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
            }
            const blob = new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            setResults({
                matched: data.matched || [],
                book_only: data.book_only || [],
                bank_only: data.bank_only || [],
                recon_type: 'gateway',
                brs: data.brs || null,
                company_name: data.company_name || '',
                account_info: data.account_info || '',
                brs_date: data.brs_date || '',
                gateway_summary: data.gateway_summary || [],
                books_match: data.books_match,
                reconciled: data.reconciled,
                summary: data.summary || {
                    book_entries: 0,
                    bank_entries: 0,
                    matched: 0,
                    matched_perfect: 0,
                    matched_with_diff: 0,
                    book_only: 0,
                    bank_only: 0,
                    difference: 0
                },
                download_url: URL.createObjectURL(blob),
                book_file_name: data.all_branches_file || '',
                statement_file_name: data.statement_file_name || '',
                book_sheets: data.all_branches_sheets || {},
                statement_sheets: {}
            });

            setStage('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadDispatch = (
        bookFile: File,
        statementFile: File,
        prevBrsFile: File | null,
        reconType: ReconType,
        hotBookFile?: File | null,
        payuOdFiles?: File[],
        cashfreeFile?: File | null,
        easebuzzFile?: File | null,
        payuFile?: File | null
    ) => {
        if (reconType === 'gateway') {
            if (!payuFile) {
                setError('PayU Regular file is required for Gateway reconciliation.');
                return;
            }
            handleGatewayUpload(bookFile, hotBookFile!, statementFile, payuFile, prevBrsFile, payuOdFiles || [], cashfreeFile || null, easebuzzFile || null);
        } else {
            handleUpload(bookFile, statementFile, prevBrsFile, reconType, hotBookFile, payuOdFiles, cashfreeFile, easebuzzFile);
        }
    };

    const handleDownload = async () => {
        if (!results?.download_url) return;
        setIsDL(true);
        try {
            const filename = results.recon_type === 'qr' ? 'QR_Reconciliation.xlsx' : results.recon_type === 'gateway' ? 'Gateway_Reconcilation.xlsx' : 'Bank_Reconciliation.xlsx';
            const a = document.createElement('a');
            a.href = results.download_url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            setIsDL(false);
        }
    };

    const handleRestart = () => {
        setStage('upload');
        setResults(null);
        setError(null);
    };

    const reconPillLabel = () => {
        if (results?.recon_type === 'qr') return '📲 QR Gateway Reconciliation';
        if (results?.recon_type === 'gateway') return '🌐 Gateway YES Bank Reconciliation';
        return '🏦 Bank Statement Reconciliation';
    };

    const reconPillClass = () => {
        if (results?.recon_type === 'qr') return styles.reconModePillQr;
        if (results?.recon_type === 'gateway') return styles.reconModePillGateway;
        return styles.reconModePillBank;
    };

    return (
        <div className={styles.app}>
            <header className={styles.appHeader}>
                <div className={styles.headerContent}>
                    <h1>Bank Reconciliation System</h1>
                    <p>Automated multi-pass matching of book entries against bank statements</p>
                </div>
            </header>

            <main className={styles.appMain}>
                {error && (
                    <div className={styles.appError}>
                        <div className={styles.appErrorBody}>
                            <span className={styles.appErrorTitle}>Error</span>
                            <span className={styles.appErrorMsg}>{error}</span>
                        </div>
                        <button className={styles.appErrorClose} onClick={() => setError(null)} aria-label="Dismiss">
                            Dismiss
                        </button>
                    </div>
                )}

                {stage === 'upload' ? (
                    <FileUpload onUpload={handleUploadDispatch} isLoading={isLoading} />
                ) : (
                    <>
                        {results?.recon_type && <div className={`${styles.reconModePill} ${reconPillClass()}`}>{reconPillLabel()}</div>}
                        <Results data={results!} onDownload={handleDownload} isDownloading={isDownloading} />
                        <div className={styles.actionBar}>
                            <button className={styles.btnOutline} onClick={handleRestart}>
                                Start New Reconciliation
                            </button>
                        </div>
                    </>
                )}
            </main>

            <footer className={styles.appFooter}>
                <p>Bank Reconciliation System</p>
            </footer>
        </div>
    );
}

export default ListReconcilationPage;
