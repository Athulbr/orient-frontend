import { useState, useCallback, useEffect, memo, useMemo } from 'react';
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
import { Play, Mail, Clock, Terminal, CheckCircle2, AlertCircle, Wifi, WifiOff, Globe, Code, GitBranch, Plus, Trash2, Dice5 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { StatusBadge } from './components/StatusBadge';
import { LogNode } from './nodes/LogNode';
import { DelayNode } from './nodes/DelayNode';
import { SidebarBtn } from './components/SidebarBtn';
import './index.css';
import { RandomNumberNode } from './nodes/RandomNumberNode';
import { sampleEdges, sampleNodes } from './StaticData';

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

const HttpNode = memo(({ data, selected }: NodeProps) => {
    const hasResponse = data.response !== undefined;
    return (
        <div
            className={`relative min-w-[100px] max-w-[200px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-100'}`}
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

const IfNode = memo(({ data, selected }: NodeProps) => {
    const condCount = data.conditions?.length || 0;

    return (
        <div
            className={`relative min-w-[240px] bg-white rounded-xl shadow-lg border-2 transition-all 
            ${selected ? 'border-cyan-500 ring-4 ring-cyan-50' : 'border-slate-100'}`}
        >
            <StatusBadge status={data.status} />

            {/* INPUT */}
            <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-400" />

            <div className="flex items-center gap-2 p-3 border-b bg-cyan-50/30 rounded-t-xl">
                <GitBranch size={14} className="text-cyan-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">IF Condition</span>
            </div>

            <div className="p-4">
                <div className="text-xs text-slate-600 mb-2">
                    {condCount} condition{condCount !== 1 ? 's' : ''} ({data.combineOperation || 'AND'})
                </div>

                {data.conditions?.slice(0, 2).map((cond: any, idx: number) => (
                    <div key={idx} className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-1 rounded mb-1 truncate">
                        {cond.field} {cond.operation} {cond.value}
                    </div>
                ))}

                {condCount > 2 && <div className="text-[9px] text-slate-400">+{condCount - 2} more</div>}
            </div>

            {/* OUTPUTS */}
            <Handle type="source" position={Position.Right} id="true" className="w-2 h-2 bg-emerald-500" style={{ top: '60%' }} />
            <Handle type="source" position={Position.Right} id="false" className="w-2 h-2 bg-red-500" style={{ top: '75%' }} />
        </div>
    );
});

const nodeTypes: NodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    logNode: LogNode,
    httpNode: HttpNode,
    jsNode: JsNode,
    ifNode: IfNode,
    randomNumberNode: RandomNumberNode
};

// ---------------- SAMPLE DATA ----------------

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

    console.log('nodes:===========', nodes);
    console.log('edges:===========', edges);

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

        newSocket.on('node-status', ({ nodeId, status }: { nodeId: string; status: string }) => {
            setNodeStatus(prev => ({ ...prev, [nodeId]: status }));
        });

        newSocket.on('node-response', ({ nodeId, response }: { nodeId: string; response: any }) => {
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
        return () => {
            newSocket.close();
        };
    }, []);

    const nodesWithStatus = useMemo(
        () => nodes.map(node => ({ ...node, data: { ...node.data, status: nodeStatus[node.id], response: nodeResponses[node.id] } })),
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
        socket.emit('execute-workflow', { nodes, edges });
    };

    const addNewNode = (type: string) => {
        const baseData: Record<string, any> = {
            logNode: { message: 'Hello' },
            delayNode: { delay: 1000 },
            emailNode: { recipient: 'user@example.com' },
            httpNode: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1' },
            jsNode: { code: 'item.json.modified = true;' },
            ifNode: { conditions: [{ field: 'httpResponse.data', operation: 'isNotEmpty', value: '' }], combineOperation: 'AND' },
            randomNumberNode: { min: 1, max: 100 }
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

    const addCondition = () => {
        if (!selectedNode || selectedNode.type !== 'ifNode') return;
        const newCondition = { field: 'httpResponse.data', operation: 'equals', value: '' };
        const conditions = [...(selectedNode.data.conditions || []), newCondition];
        updateNodeData('conditions', conditions);
    };

    const updateCondition = (index: number, field: string, value: any) => {
        if (!selectedNode || selectedNode.type !== 'ifNode') return;
        const conditions = [...selectedNode.data.conditions];
        conditions[index] = { ...conditions[index], [field]: value };
        updateNodeData('conditions', conditions);
    };

    const removeCondition = (index: number) => {
        if (!selectedNode || selectedNode.type !== 'ifNode') return;
        const conditions = selectedNode.data.conditions.filter((_: any, i: number) => i !== index);
        updateNodeData('conditions', conditions);
    };

    const onNodesChange: OnNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), []);
    const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), []);

    const onConnect: OnConnect = useCallback(params => {
        const newEdge: any = { ...params, animated: true };
        if (params.sourceHandle) {
            newEdge.label = params.sourceHandle.toUpperCase();
            newEdge.style = { stroke: params.sourceHandle === 'true' ? '#10b981' : '#ef4444' };
            newEdge.labelBgStyle = { fill: params.sourceHandle === 'true' ? '#d1fae5' : '#fee2e2' };
        }
        setEdges(eds => addEdge(newEdge, eds));
    }, []);

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <aside className="w-80 bg-white border-r flex flex-col shadow-xl z-20 overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
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
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>
                    <div
                        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                    >
                        {isConnected ? (
                            <>
                                <Wifi size={12} />
                                <span>Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff size={12} />
                                <span>Offline</span>
                            </>
                        )}
                    </div>
                    {errorMessage && (
                        <div className="mt-3 flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700">
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <SidebarBtn icon={<Mail size={16} />} label="Email" onClick={() => addNewNode('emailNode')} />
                    <SidebarBtn icon={<Clock size={16} />} label="Delay" onClick={() => addNewNode('delayNode')} />
                    <SidebarBtn icon={<Terminal size={16} />} label="Log" onClick={() => addNewNode('logNode')} />
                    <SidebarBtn icon={<Globe size={16} />} label="HTTP Request" onClick={() => addNewNode('httpNode')} />
                    <SidebarBtn icon={<Code size={16} />} label="JavaScript" onClick={() => addNewNode('jsNode')} />
                    <SidebarBtn icon={<GitBranch size={16} />} label="IF Condition" onClick={() => addNewNode('ifNode')} />
                    <SidebarBtn icon={<Dice5 size={16} />} label="Random Number" onClick={() => addNewNode('randomNumberNode')} />

                    {selectedNode && selectedNode.type === 'ifNode' && (
                        <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                            <h3 className="text-xs font-bold uppercase mb-4 text-cyan-700">IF Conditions</h3>

                            <div className="mb-4">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Combine</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedNode.data.combineOperation || 'AND'}
                                    onChange={e => updateNodeData('combineOperation', e.target.value)}
                                >
                                    <option value="AND">AND (all must match)</option>
                                    <option value="OR">OR (any can match)</option>
                                </select>
                            </div>

                            <div className="space-y-3 mb-3">
                                {(selectedNode.data.conditions || []).map((cond: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white rounded-lg border border-cyan-200 space-y-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-bold text-slate-400">CONDITION {idx + 1}</span>
                                            <button onClick={() => removeCondition(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Field Path</label>
                                            <input
                                                className="w-full p-2 border rounded text-xs font-mono"
                                                placeholder="e.g. data[0].name or users[2].email"
                                                value={cond.field}
                                                onChange={e => updateCondition(idx, 'field', e.target.value)}
                                            />
                                            <p className="text-[8px] text-slate-400 mt-1">Use [0], [1] for arrays • Combine: data.users[0].name</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Operation</label>
                                            <select
                                                className="w-full p-2 border rounded text-xs"
                                                value={cond.operation}
                                                onChange={e => updateCondition(idx, 'operation', e.target.value)}
                                            >
                                                <option value="equals">Equals</option>
                                                <option value="notEquals">Not Equals</option>
                                                <option value="contains">Contains</option>
                                                <option value="notContains">Not Contains</option>
                                                <option value="greaterThan">Greater Than</option>
                                                <option value="lessThan">Less Than</option>
                                                <option value="greaterThanOrEqual">Greater or Equal</option>
                                                <option value="lessThanOrEqual">Less or Equal</option>
                                                <option value="isEmpty">Is Empty</option>
                                                <option value="isNotEmpty">Is Not Empty</option>
                                                <option value="isTrue">Is True</option>
                                                <option value="isFalse">Is False</option>
                                                <option value="isArray">Is Array</option>
                                                <option value="arrayContains">Array Contains</option>
                                                <option value="arrayLength">Array Length Equals</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Value</label>
                                            <input
                                                className="w-full p-2 border rounded text-xs"
                                                placeholder="Comparison value"
                                                value={cond.value}
                                                onChange={e => updateCondition(idx, 'value', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addCondition}
                                className="w-full flex items-center justify-center gap-2 p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-xs font-medium"
                            >
                                <Plus size={14} />
                                Add Condition
                            </button>
                        </div>
                    )}

                    {selectedNode && selectedNode.type !== 'ifNode' && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="text-xs font-bold uppercase mb-4 text-indigo-600">Edit {selectedNode.type}</h3>
                            {Object.keys(selectedNode.data).map(
                                key =>
                                    key !== 'status' &&
                                    key !== 'response' && (
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

            <main className="flex-grow relative h-full">
                <ReactFlow
                    className="dark-flow"
                    nodes={nodesWithStatus}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_, n) => setSelectedNodeId(n.id)}
                    onPaneClick={() => setSelectedNodeId(null)}
                    nodeTypes={nodeTypes}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                >
                    <Background color="#cbd5e1" gap={16} size={1} />
                    <Controls />
                </ReactFlow>
            </main>
        </div>
    );
}
