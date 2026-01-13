import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    NodeTypes,
    NodeProps,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Mail, Clock, Terminal, Settings, CheckCircle2, AlertCircle, Wifi, WifiOff, Globe, Code } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Sample data
const sampleNodes: Node[] = [
    {
        id: 'log-1',
        type: 'logNode',
        position: { x: 250, y: 100 },
        data: { message: 'Workflow started' }
    },
    {
        id: 'delay-1',
        type: 'delayNode',
        position: { x: 500, y: 100 },
        data: { delay: 2000 }
    }
];

const sampleEdges: Edge[] = [
    {
        id: 'e1-2',
        source: 'log-1',
        target: 'delay-1',
        animated: true
    }
];

// ---------------- STATUS ICON COMPONENT ----------------

const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'running') {
        return (
            <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1 rounded-full shadow-lg z-50">
                <Settings size={14} className="animate-spin" />
            </div>
        );
    }
    if (status === 'success') {
        return (
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg z-50">
                <CheckCircle2 size={14} />
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg z-50">
                <AlertCircle size={14} />
            </div>
        );
    }
    return null;
};

// ---------------- CUSTOM NODE COMPONENTS ----------------

const EmailNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[200px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-indigo-50/30 rounded-t-xl">
            <Mail size={14} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Email</span>
        </div>
        <div className="p-4">
            <p className="text-sm font-semibold truncate">{data.recipient || 'No Recipient'}</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));

const DelayNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-amber-50/30 rounded-t-xl">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Delay</span>
        </div>
        <div className="p-4">
            <p className="text-sm font-semibold">{data.delay || 1000}ms</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));

const LogNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-emerald-50/30 rounded-t-xl">
            <Terminal size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Log</span>
        </div>
        <div className="p-4 bg-slate-900 m-2 rounded">
            <p className="text-[10px] font-mono text-emerald-400 truncate">{`> ${data.message || '...'}`}</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));

const HttpNode = memo(({ data, selected }: NodeProps) => {
    const hasResponse = data.response !== undefined;
    return (
        <div
            className={`relative min-w-[200px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-100'}`}
        >
            <StatusBadge status={data.status} />
            <Handle type="target" position={Position.Left} />
            <div className="flex items-center gap-2 p-3 border-b bg-purple-50/30 rounded-t-xl">
                <Globe size={14} className="text-purple-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">HTTP Request</span>
                {hasResponse && <CheckCircle2 size={10} className="text-emerald-500 ml-auto" />}
            </div>
            <div className="p-4 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-600">{data.method || 'GET'}</span>
                    <span className="text-xs text-slate-400">•</span>
                </div>
                <p className="text-xs text-slate-600 truncate">{data.url || 'No URL set'}</p>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
});

const JsNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[200px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-orange-500 ring-4 ring-orange-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-orange-50/30 rounded-t-xl">
            <Code size={14} className="text-orange-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">JavaScript</span>
        </div>
        <div className="p-4 bg-slate-900 m-2 rounded">
            <p className="text-[10px] font-mono text-orange-400 truncate">{data.code ? `${data.code.substring(0, 30)}...` : 'No code'}</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));

const nodeTypes: NodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    logNode: LogNode,
    httpNode: HttpNode,
    jsNode: JsNode
};

// ---------------- MAIN EDITOR ----------------

export default function WorkflowEditor() {
    const [nodes, setNodes] = useState<Node[]>(sampleNodes);
    const [edges, setEdges] = useState<Edge[]>(sampleEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [nodeStatus, setNodeStatus] = useState<Record<string, string>>({});
    const [nodeResponses, setNodeResponses] = useState<Record<string, any>>({});
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

    // Socket connection
    useEffect(() => {
        const newSocket = io('http://localhost:4000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to server');
            setIsConnected(true);
            setErrorMessage(null);
        });

        newSocket.on('disconnect', reason => {
            console.log('❌ Disconnected from server:', reason);
            setIsConnected(false);
            setIsRunning(false);
            setErrorMessage('Disconnected from server');
        });

        newSocket.on('connect_error', error => {
            console.error('Connection error:', error);
            setIsConnected(false);
            setErrorMessage('Cannot connect to server. Make sure the backend is running on http://localhost:4000');
        });

        newSocket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            setIsConnected(false);
            setErrorMessage('Failed to reconnect to server');
        });

        newSocket.on('node-status', ({ nodeId, status }: { nodeId: string; status: string }) => {
            console.log('Node status update:', nodeId, status);
            setNodeStatus(prev => ({ ...prev, [nodeId]: status }));
        });

        newSocket.on('node-response', ({ nodeId, response }: { nodeId: string; response: any }) => {
            console.log('Node response:', nodeId, response);
            setNodeResponses(prev => ({ ...prev, [nodeId]: response }));
        });

        newSocket.on('workflow-complete', () => {
            console.log('✅ Workflow completed');
            setIsRunning(false);
        });

        newSocket.on('workflow-error', ({ message }: { message: string }) => {
            console.error('Workflow error:', message);
            setErrorMessage(message);
            setIsRunning(false);
        });

        setSocket(newSocket);

        // Check connection status periodically
        const checkInterval = setInterval(() => {
            if (newSocket.connected !== isConnected) {
                setIsConnected(newSocket.connected);
            }
        }, 1000);

        return () => {
            clearInterval(checkInterval);
            newSocket.close();
        };
    }, []);

    // Merge status and responses into nodes for rendering
    const nodesWithStatus = useMemo(
        () =>
            nodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    status: nodeStatus[node.id],
                    response: nodeResponses[node.id]
                }
            })),
        [nodes, nodeStatus, nodeResponses]
    );

    const executeWorkflow = () => {
        if (!socket || !isConnected) {
            setErrorMessage('Not connected to server. Please check if the backend is running.');
            return;
        }

        if (!nodes.length) {
            setErrorMessage('No nodes to execute');
            return;
        }

        setIsRunning(true);
        setNodeStatus({});
        setNodeResponses({});
        setErrorMessage(null);

        console.log('Executing workflow with', nodes.length, 'nodes and', edges.length, 'edges');
        socket.emit('execute-workflow', { nodes, edges });
    };

    const addNewNode = (type: string) => {
        const baseData: Record<string, any> = {
            logNode: { message: 'Hello' },
            delayNode: { delay: 1000 },
            emailNode: { recipient: 'user@example.com' },
            httpNode: { method: 'GET', url: 'https://api.example.com' },
            jsNode: { code: 'console.log("Hello from JS!");' }
        };
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 250, y: 150 },
            data: baseData[type] || {}
        };
        setNodes(nds => [...nds, newNode]);
    };

    const updateNodeData = (field: string, value: any) => {
        setNodes(nds => nds.map(n => (n.id === selectedNodeId ? { ...n, data: { ...n.data, [field]: value } } : n)));
    };

    const onNodesChange: OnNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), []);

    const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), []);

    const onConnect: OnConnect = useCallback(params => setEdges(eds => addEdge({ ...params, animated: true }, eds)), []);

    return (
        <div className="flex h-screen w-full bg-slate-50">
            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r flex flex-col shadow-xl z-20">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold italic text-indigo-600">Workflow</h1>
                        <button
                            onClick={executeWorkflow}
                            disabled={isRunning || !isConnected}
                            className={`p-2 rounded-lg transition-all ${
                                isRunning
                                    ? 'bg-amber-100 text-amber-600 animate-pulse cursor-not-allowed'
                                    : !isConnected
                                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                            title={!isConnected ? 'Server not connected' : 'Run workflow'}
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>

                    {/* Connection Status */}
                    <div
                        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                            isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {isConnected ? (
                            <>
                                <Wifi size={12} />
                                <span>Connected to server</span>
                            </>
                        ) : (
                            <>
                                <WifiOff size={12} />
                                <span>Server offline</span>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mt-3 flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700">
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <SidebarBtn icon={<Mail size={16} />} label="Email" onClick={() => addNewNode('emailNode')} />
                    <SidebarBtn icon={<Clock size={16} />} label="Delay" onClick={() => addNewNode('delayNode')} />
                    <SidebarBtn icon={<Terminal size={16} />} label="Log" onClick={() => addNewNode('logNode')} />
                    <SidebarBtn icon={<Globe size={16} />} label="HTTP Request" onClick={() => addNewNode('httpNode')} />
                    <SidebarBtn icon={<Code size={16} />} label="JavaScript" onClick={() => addNewNode('jsNode')} />

                    {selectedNode && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="text-xs font-bold uppercase mb-4 text-indigo-600">Edit {selectedNode.type}</h3>
                            {Object.keys(selectedNode.data).map(
                                key =>
                                    key !== 'status' && (
                                        <div key={key} className="mb-3">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">{key}</label>
                                            {key === 'code' ? (
                                                <textarea
                                                    className="w-full p-2 border rounded mt-1 text-sm shadow-sm font-mono"
                                                    rows={4}
                                                    value={selectedNode.data[key]}
                                                    onChange={e => updateNodeData(key, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full p-2 border rounded mt-1 text-sm shadow-sm"
                                                    value={selectedNode.data[key]}
                                                    onChange={e => updateNodeData(key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )
                            )}
                        </div>
                    )}

                    {selectedNode && nodeResponses[selectedNode.id] && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="text-xs font-bold uppercase mb-3 text-purple-600">Response Data</h3>
                            <div className="bg-slate-900 p-3 rounded overflow-auto max-h-64">
                                <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-words">
                                    {JSON.stringify(nodeResponses[selectedNode.id], null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* CANVAS */}
            <main className="flex-grow relative h-full">
                <ReactFlow
                    nodes={nodesWithStatus}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_, n) => setSelectedNodeId(n.id)}
                    onPaneClick={() => setSelectedNodeId(null)}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#cbd5e1" gap={16} size={1} />
                    <Controls />
                </ReactFlow>
            </main>
        </div>
    );
}

const SidebarBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group"
    >
        <div className="p-2 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors">{icon}</div>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
    </button>
);
