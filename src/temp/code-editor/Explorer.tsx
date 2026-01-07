import { useState } from 'react';
import { FileNode } from '.';

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
