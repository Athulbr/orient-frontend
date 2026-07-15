import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, Server, Zap, Database, Cpu, MemoryStick, RefreshCw, Wifi, WifiOff, BarChart2 } from 'lucide-react';
import { config } from '../../../../../../config/default';

// ── Types ──────────────────────────────────────────────────────────────────────

interface HealthData {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    database: {
        status: string;
        responseTime: number;
        message: string;
    };
    memory: {
        heapUsed: string;
        heapTotal: string;
        rss: string;
    };
    gemini?: {
        status: string;
        message?: string;
    };
    error?: string;
}

interface GeminiHealthData {
    status: 'operational' | 'degraded' | 'error' | 'unknown';
    message?: string;
    source?: 'api' | 'redis';
}

interface HistoryEntry {
    ts: Date;
    status: 'ok' | 'degraded' | 'error';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const statusColor = (s: string) => {
    if (s === 'ok' || s === 'healthy' || s === 'operational') return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e', light: '#dcfce7' };
    if (s === 'degraded') return { bg: '#fefce8', text: '#854d0e', border: '#fde68a', dot: '#f59e0b', light: '#fef9c3' };
    return { bg: '#fff1f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444', light: '#fee2e2' };
};

const statusLabel = (s: string) => {
    if (s === 'ok' || s === 'healthy' || s === 'operational') return 'Operational';
    if (s === 'degraded') return 'Degraded';
    return 'Unavailable';
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const c = statusColor(status);
    const Icon = status === 'ok' || status === 'healthy' || status === 'operational' ? CheckCircle2 : status === 'degraded' ? AlertCircle : XCircle;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.02em',
                backgroundColor: c.light,
                color: c.text,
                border: `1.5px solid ${c.border}`
            }}
        >
            <Icon size={12} /> {statusLabel(status)}
        </span>
    );
};

const PulseDot: React.FC<{ status: string }> = ({ status }) => {
    const c = statusColor(status);
    return (
        <span style={{ position: 'relative', display: 'inline-flex', width: 12, height: 12 }}>
            <span
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    backgroundColor: c.dot,
                    opacity: 0.35,
                    animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite'
                }}
            />
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c.dot, display: 'inline-block' }} />
        </span>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const ServerStatusPage: React.FC = () => {
    const navigate = useNavigate();
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(10);
    const [geminiHealth, setGeminiHealth] = useState<GeminiHealthData | null>(null);
    const [geminiLastUpdated, setGeminiLastUpdated] = useState<Date | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const geminiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchHealth = useCallback(async () => {
        try {
            const res = await fetch(`${config.workflowService}/api/health`);
            const data: HealthData = await res.json();
            setHealth(data);
            setLastUpdated(new Date());
            setHistory(prev => [{ ts: new Date(), status: data.status }, ...prev.slice(0, 29)]);
        } catch {
            const errData: HealthData = {
                status: 'error',
                timestamp: new Date().toISOString(),
                uptime: 0,
                database: { status: 'unreachable', responseTime: 0, message: 'Could not reach server' },
                memory: { heapUsed: '—', heapTotal: '—', rss: '—' },
                error: 'Failed to connect to workflow service'
            };
            setHealth(errData);
            setLastUpdated(new Date());
            setHistory(prev => [{ ts: new Date(), status: 'error' }, ...prev.slice(0, 29)]);
        } finally {
            setLoading(false);
            setCountdown(10);
        }
    }, []);

    const fetchGeminiHealth = useCallback(async () => {
        try {
            const res = await fetch(`${config.workflowService}/api/health/gemini`);
            const data: GeminiHealthData = await res.json();
            setGeminiHealth(data);
            setGeminiLastUpdated(new Date());
        } catch {
            setGeminiHealth({ status: 'error', message: 'Could not reach Gemini health API' });
            setGeminiLastUpdated(new Date());
        }
    }, []);

    const handleRefreshAll = useCallback(() => {
        fetchHealth();
        fetchGeminiHealth();
    }, [fetchHealth, fetchGeminiHealth]);

    useEffect(() => {
        fetchHealth();
        fetchGeminiHealth();
        intervalRef.current = setInterval(fetchHealth, 10000);
        geminiIntervalRef.current = setInterval(fetchGeminiHealth, 60000);
        countdownRef.current = setInterval(() => setCountdown(p => (p <= 1 ? 10 : p - 1)), 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (geminiIntervalRef.current) clearInterval(geminiIntervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [fetchHealth, fetchGeminiHealth]);

    const serverStatus = health?.status ?? 'error';
    const geminiStatus = geminiHealth?.status ?? 'error';
    const dbStatus = health?.database?.status ?? 'error';
    const isOnline = serverStatus === 'ok';

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                .ss-in { animation: fadeUp 0.35s ease both; }
                .ss-back:hover { background: #f1f5f9 !important; border-color: #cbd5e1 !important; }
                .ss-refresh:hover { background: #ede9fe !important; color: #4f46e5 !important; }
                .ss-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
                .ss-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
            `}</style>

            {/* ── Header ── */}
            <header
                style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '0 40px',
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        className="ss-back"
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '6px 14px',
                            fontSize: 13,
                            fontWeight: 500,
                            transition: 'all 0.15s'
                        }}
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 9,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                            }}
                        >
                            <Activity size={17} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Service Health</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Workflow Service · Real-time monitoring</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {!loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <PulseDot status={serverStatus} />
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{isOnline ? 'All systems operational' : 'Service issues detected'}</span>
                        </div>
                    )}
                    <button
                        className="ss-refresh"
                        onClick={handleRefreshAll}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#eef2ff',
                            border: '1px solid #c7d2fe',
                            borderRadius: 8,
                            color: '#6366f1',
                            cursor: 'pointer',
                            padding: '7px 16px',
                            fontSize: 13,
                            fontWeight: 600,
                            transition: 'all 0.15s'
                        }}
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <main style={{ flex: 1, padding: '32px 40px 56px', width: '100%', boxSizing: 'border-box' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                border: '3px solid #e2e8f0',
                                borderTop: '3px solid #6366f1',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}
                        />
                        <p style={{ color: '#94a3b8', fontSize: 14 }}>Fetching service health…</p>
                    </div>
                ) : (
                    <>
                        {/* ── Section label ── */}
                        <div className="ss-in" style={{ marginBottom: 20 }}>
                            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Service Overview</h2>
                        </div>

                        {/* ── Service Cards ── */}
                        <div className="ss-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, animationDelay: '0.05s' }}>
                            <ServiceCard
                                icon={<Server size={20} />}
                                title="Server Health"
                                status={serverStatus}
                                description={
                                    serverStatus === 'ok'
                                        ? 'Workflow service is running normally with no issues.'
                                        : serverStatus === 'degraded'
                                          ? 'Service is running but experiencing some issues.'
                                          : (health?.error ?? 'Workflow service is unreachable.')
                                }
                                meta={[
                                    { label: 'Uptime', value: health?.uptime ? formatUptime(health.uptime) : '—', icon: <Clock size={12} /> },
                                    { label: 'Checked', value: lastUpdated?.toLocaleTimeString() ?? '—', icon: <RefreshCw size={12} /> }
                                ]}
                            />
                            <ServiceCard
                                icon={<Zap size={20} />}
                                title="Gemini Health"
                                status={geminiStatus}
                                description={
                                    geminiHealth?.message ??
                                    (geminiStatus === 'operational'
                                        ? 'Gemini AI service is reachable and responding to requests.'
                                        : geminiStatus === 'degraded'
                                          ? 'Gemini AI service is experiencing some degradation.'
                                          : 'Gemini AI service status could not be determined.')
                                }
                                meta={[
                                    { label: 'Source', value: geminiHealth?.source === 'redis' ? 'Cached (Redis)' : 'Real-time API', icon: <Wifi size={12} /> },
                                    { label: 'Checked', value: geminiLastUpdated?.toLocaleTimeString() ?? '—', icon: <RefreshCw size={12} /> }
                                ]}
                            />
                        </div>

                        {/* ── Metrics ── */}
                        <div className="ss-in" style={{ marginBottom: 12, animationDelay: '0.1s' }}>
                            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>System Metrics</h2>
                        </div>
                        <div className="ss-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32, animationDelay: '0.15s' }}>
                            <MetricTile
                                icon={<Database size={18} color="#6366f1" />}
                                label="Database"
                                accentColor="#6366f1"
                                value={<StatusPill status={dbStatus} />}
                                sub={health?.database?.responseTime ? `${health.database.responseTime}ms response` : (health?.database?.message ?? '—')}
                            />
                            <MetricTile
                                icon={<Cpu size={18} color="#8b5cf6" />}
                                label="Heap Used"
                                accentColor="#8b5cf6"
                                value={<span style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{health?.memory?.heapUsed ?? '—'}</span>}
                                sub={`of ${health?.memory?.heapTotal ?? '—'} total`}
                            />
                            <MetricTile
                                icon={<MemoryStick size={18} color="#0891b2" />}
                                label="RSS Memory"
                                accentColor="#0891b2"
                                value={<span style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{health?.memory?.rss ?? '—'}</span>}
                                sub="Resident Set Size"
                            />
                            <MetricTile
                                icon={<Clock size={18} color="#f59e0b" />}
                                label="Uptime"
                                accentColor="#f59e0b"
                                value={<span style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{health?.uptime ? formatUptime(health.uptime) : '—'}</span>}
                                sub={health?.timestamp && health?.uptime ? `Since ${new Date(new Date(health.timestamp).getTime() - health.uptime * 1000).toLocaleString()}` : '—'}
                            />
                        </div>

                        {/* ── Poll History ── */}
                        {/* {history.length > 0 && (
                            <>
                                <div className="ss-in" style={{ marginBottom: 16, animationDelay: '0.2s' }}>
                                    <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                                        Poll History
                                    </h2>
                                </div>
                                <div className="ss-in" style={{
                                    background: '#ffffff', border: '1px solid #e2e8f0',
                                    borderRadius: 16, padding: '24px 28px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                    animationDelay: '0.25s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <BarChart2 size={16} color="#6366f1" />
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Check History</span>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                                            Last {history.length} polls · every 10s
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56 }}>
                                        {[...history].reverse().map((h, i) => {
                                            const c = statusColor(h.status);
                                            const opacity = 0.25 + (i / history.length) * 0.75;
                                            return (
                                                <div
                                                    key={i}
                                                    title={`${h.ts.toLocaleTimeString()} — ${statusLabel(h.status)}`}
                                                    style={{
                                                        flex: 1, minWidth: 6, borderRadius: 4,
                                                        height: '100%', backgroundColor: c.dot,
                                                        opacity, transition: 'opacity 0.2s', cursor: 'default',
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                        <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 500 }}>Oldest</span>
                                        <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 500 }}>Latest</span>
                                    </div>
                                </div>
                            </>
                        )} */}
                    </>
                )}
            </main>

            {/* ── Footer ── */}
            <footer
                style={{
                    background: '#ffffff',
                    borderTop: '1px solid #e2e8f0',
                    padding: '14px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b' }}>
                    {isOnline ? (
                        <>
                            <Wifi size={13} color="#22c55e" />
                            <span>
                                Connected to <strong style={{ color: '#475569' }}>{config.workflowService}</strong>
                            </span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={13} color="#ef4444" />
                            <span>
                                Cannot reach <strong style={{ color: '#475569' }}>{config.workflowService}</strong>
                            </span>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#94a3b8' }}>
                    <span
                        style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#6366f1',
                            animation: 'ping 1.6s ease-in-out infinite'
                        }}
                    />
                    Auto-refreshing in <strong style={{ color: '#6366f1', marginLeft: 2 }}>{countdown}s</strong>
                    {lastUpdated && <span style={{ color: '#cbd5e1', marginLeft: 10 }}>· Updated {lastUpdated.toLocaleTimeString()}</span>}
                </div>
            </footer>
        </div>
    );
};

// ── ServiceCard ────────────────────────────────────────────────────────────────

interface MetaItem {
    label: string;
    value: string;
    icon: React.ReactNode;
}

const ServiceCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    status: string;
    description: string;
    meta?: MetaItem[];
}> = ({ icon, title, status, description, meta }) => {
    const c = statusColor(status);
    return (
        <div
            className="ss-card"
            style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '24px 28px',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${c.dot}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: c.light,
                            border: `1px solid ${c.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: c.text
                        }}
                    >
                        {icon}
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{title}</div>
                        <StatusPill status={status} />
                    </div>
                </div>
                <PulseDot status={status} />
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: '0 0 16px' }}>{description}</p>

            {meta && meta.length > 0 && (
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                    {meta.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                            <span style={{ color: '#94a3b8' }}>{m.icon}</span>
                            {m.label}:&nbsp;<strong style={{ color: '#334155' }}>{m.value}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── MetricTile ────────────────────────────────────────────────────────────────

const MetricTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    sub?: string;
    accentColor: string;
}> = ({ icon, label, value, sub, accentColor }) => (
    <div
        className="ss-card"
        style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            borderTop: `3px solid ${accentColor}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            {icon}
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        </div>
        <div style={{ marginBottom: sub ? 6 : 0 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{sub}</div>}
    </div>
);

export default ServerStatusPage;
