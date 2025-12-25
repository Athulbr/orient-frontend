import React, { useState, useCallback } from 'react';
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
    NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Play, Mail, Clock, Terminal, MousePointer2 } from 'lucide-react';
import { EmailNode, DelayNode, LogNode } from './Nodes';
import { sampleEdges, sampleNodes } from './StaticData';
import './index.css';

const nodeTypes: NodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    logNode: LogNode
};

export default function WorkflowEditor() {
    const [nodes, setNodes] = useState<Node[]>(sampleNodes);
    const [edges, setEdges] = useState<Edge[]>(sampleEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    // --- EXECUTION ENGINE ---
    const executeWorkflow = async () => {
        if (nodes.length === 0) return;
        setIsRunning(true);
        console.log('🚀 Workflow Started');

        // Find root nodes (no incoming edges)
        const startNodes = nodes.filter(node => !edges.find(edge => edge.target === node.id));

        for (const node of startNodes) {
            await runNode(node);
        }

        setIsRunning(false);
        console.log('✅ Workflow Finished');
    };

    const runNode = async (node: Node) => {
        // 1. Execute current node action
        switch (node.type) {
            case 'logNode':
                console.log(`[CONSOLE]: ${node.data.message}`);
                break;
            case 'delayNode':
                const ms = parseInt(node.data.delay) || 1000;
                console.log(`[WAITING]: ${ms}ms...`);
                await new Promise(res => setTimeout(res, ms));
                break;
            case 'emailNode':
                console.log(`[EMAIL]: Sent to ${node.data.recipient}`);
                break;
        }

        // 2. Find next connected nodes and execute them
        const nextEdges = edges.filter(edge => edge.source === node.id);
        for (const edge of nextEdges) {
            const nextNode = nodes.find(n => n.id === edge.target);
            if (nextNode) await runNode(nextNode);
        }
    };

    // --- FLOW HANDLERS ---
    const onConnect: OnConnect = useCallback(
        params => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
        []
    );

    const onNodesChange: OnNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), []);

    const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), []);

    const addNewNode = (type: string) => {
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 50, y: 50 },
            data: {
                message: 'Hello!',
                delay: 2000,
                recipient: 'user@example.com'
            }
        };
        setNodes(nds => [...nds, newNode]);
    };

    const updateNodeData = (field: string, value: any) => {
        setNodes(nds => nds.map(n => (n.id === selectedNodeId ? { ...n, data: { ...n.data, [field]: value } } : n)));
    };

    return (
        <div className="flex h-screen w-full bg-slate-50">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
                <div className="p-6 border-b flex items-center justify-between">
                    <h1 className="text-xl font-bold italic text-indigo-600">flow.ai</h1>
                    <button
                        onClick={executeWorkflow}
                        disabled={isRunning}
                        className={`p-2 rounded-lg transition-all ${isRunning ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <section>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Nodes</h3>
                        <div className="space-y-2">
                            <SidebarBtn icon={<Mail size={16} />} label="Email" onClick={() => addNewNode('emailNode')} color="bg-indigo-600" />
                            <SidebarBtn icon={<Clock size={16} />} label="Delay" onClick={() => addNewNode('delayNode')} color="bg-amber-500" />
                            <SidebarBtn icon={<Terminal size={16} />} label="Log" onClick={() => addNewNode('logNode')} color="bg-emerald-500" />
                        </div>
                    </section>

                    {selectedNode && (
                        <section className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Config: {selectedNode.type}</h3>
                            {selectedNode.type === 'logNode' && (
                                <input
                                    className="w-full p-2 text-sm border rounded"
                                    value={selectedNode.data.message}
                                    onChange={e => updateNodeData('message', e.target.value)}
                                />
                            )}
                            {selectedNode.type === 'delayNode' && (
                                <input
                                    type="number"
                                    className="w-full p-2 text-sm border rounded"
                                    value={selectedNode.data.delay}
                                    onChange={e => updateNodeData('delay', e.target.value)}
                                />
                            )}
                            {selectedNode.type === 'emailNode' && (
                                <input
                                    className="w-full p-2 text-sm border rounded"
                                    value={selectedNode.data.recipient}
                                    onChange={e => updateNodeData('recipient', e.target.value)}
                                />
                            )}
                        </section>
                    )}
                </div>
            </aside>

            {/* Canvas */}
            <main className="flex-grow relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_, n) => setSelectedNodeId(n.id)}
                    onPaneClick={() => setSelectedNodeId(null)}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#cbd5e1" variant={'dots' as any} />
                    <Controls />
                </ReactFlow>
            </main>
        </div>
    );
}

const SidebarBtn = ({ icon, label, onClick, color }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-white shadow-sm transition-all group"
    >
        <div className={`p-2 ${color} rounded-lg text-white group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
    </button>
);
