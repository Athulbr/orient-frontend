import React from 'react';
import { diffWords } from 'diff';

interface TextDiffProps {
    oldText: string;
    newText: string;
}

const TextDiff: React.FC<TextDiffProps> = ({ oldText, newText }) => {
    const diff = diffWords(oldText, newText);

    return (
        <p>
            {diff.map((part, index) => (
                <span
                    key={index}
                    style={{
                        color: part.added ? 'green' : part.removed ? 'red' : 'black',
                        textDecoration: part.removed ? 'line-through' : 'none'
                    }}
                >
                    {part.value}
                </span>
            ))}
        </p>
    );
};

export default TextDiff;
