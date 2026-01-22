import { RichTextEditor } from '../../../components/RichTextEditor';

export default function PreviewContainer({ content, setContent }: { content: string; setContent: (content: string) => void }) {
    return (
        <div className=" px-4">
            <div className="p-3">
                <p className="text-xl font-semibold">Content Preview</p>
            </div>
            <RichTextEditor height="calc(100vh - 52px)" value={content} onChange={value => setContent(value)} />
        </div>
    );
}

const aaaa = '';
