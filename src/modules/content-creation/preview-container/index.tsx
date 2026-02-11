import { RichTextEditor } from '../../../components/RichTextEditor';
import BackButton from '../../../components/BackButton';

export default function PreviewContainer({ content, setContent, name }: { content: string; setContent: (content: string) => void; name: string }) {
    return (
        <div className="px-4">
            <div className="p-3 flex items-center gap-3">
                <BackButton />
                <p className="text-xl font-semibold">Content Preview: {name}</p>
            </div>
            <RichTextEditor height="calc(100vh - 52px)" value={content} onChange={value => setContent(value)} />
        </div>
    );
}

const aaaa = '';
