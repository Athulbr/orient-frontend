import { useEffect, useState } from 'react';

export type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
};

const API = 'http://localhost:4000';

export function CodeEditor() {
    const [tree, setTree] = useState<FileNode[]>([]);
    const [content, setContent] = useState('');
    const [activeFile, setActiveFile] = useState('');

    useEffect(() => {
        fetch(`${API}/tree`)
            .then(res => res.json())
            .then(setTree);
    }, []);

    const openFile = async (path: string) => {
        setActiveFile(path);
        const res = await fetch(`${API}/file?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setContent(data.content);
    };

    return (
        <div className="h-screen flex bg-[#1e1e1e] text-[#cccccc] font-mono">
            <Explorer tree={tree} onFileClick={openFile} activeFile={activeFile} />
            <MonacoEditor content={content} file={activeFile} />
        </div>
    );
}

export const Explorer = ({ tree, onFileClick, activeFile }: { tree: FileNode[]; onFileClick: (path: string) => void; activeFile: string }) => (
    <div className="w-64 bg-[#252526] border-r border-[#333] overflow-auto">
        <div className="px-3 py-2 text-xs text-[#bbbbbb] font-semibold">EXPLORER</div>

        <FileTree nodes={tree} onFileClick={onFileClick} activeFile={activeFile} />
    </div>
);

const FileTree = ({
    nodes,
    level = 0,
    onFileClick,
    activeFile
}: {
    nodes: FileNode[];
    level?: number;
    onFileClick: (path: string) => void;
    activeFile: string;
}) => (
    <div className="p-4">
        {nodes.map(node =>
            node.type === 'folder' ? (
                <FolderNode key={node.path} node={node} level={level} onFileClick={onFileClick} activeFile={activeFile} />
            ) : (
                <FileNodeItem key={node.path} node={node} level={level} onFileClick={onFileClick} activeFile={activeFile} />
            )
        )}
    </div>
);

const FolderNode = ({ node, level, onFileClick, activeFile }: { node: FileNode; level: number; onFileClick: (path: string) => void; activeFile: string }) => {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <div onClick={() => setOpen(!open)} className="flex items-center cursor-pointer select-none hover:bg-[#2a2d2e]" style={{ paddingLeft: level * 14 }}>
                <span className="w-4 text-xs">{open ? '▼' : '▶'}</span>
                <span className="text-[#c5c5c5] py-0.5">{node.name}</span>
            </div>

            {open && node.children && <FileTree nodes={node.children} level={level + 1} onFileClick={onFileClick} activeFile={activeFile} />}
        </div>
    );
};

const FileNodeItem = ({ node, level, onFileClick, activeFile }: { node: FileNode; level: number; onFileClick: (path: string) => void; activeFile: string }) => (
    <div
        onClick={() => onFileClick(node.path)}
        className={`cursor-pointer py-0.5 px-1 rounded
      ${activeFile === node.path ? 'bg-[#373737]' : 'hover:bg-[#2a2d2e]'}`}
        style={{ paddingLeft: level * 14 + 16 }}
    >
        {node.name}
    </div>
);

import Editor from '@monaco-editor/react';

const getLanguage = (file: string) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) return 'typescript';
    if (file.endsWith('.js') || file.endsWith('.jsx')) return 'javascript';
    if (file.endsWith('.json')) return 'json';
    if (file.endsWith('.css')) return 'css';
    if (file.endsWith('.html')) return 'html';
    return 'plaintext';
};

export const MonacoEditor = ({ content, file }: { content: string; file: string }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="h-9 bg-[#2d2d2d] border-b border-[#333] px-4 flex items-center text-sm text-[#cccccc]">{file || 'No file selected'}</div>

            <Editor
                height="100%"
                language={getLanguage(file)}
                value={content}
                theme="vs-dark"
                options={{
                    readOnly: false,
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    cursorStyle: 'line',
                    renderLineHighlight: 'line'
                }}
            />
        </div>
    );
};
