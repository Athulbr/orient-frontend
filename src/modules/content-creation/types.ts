export interface Message {
    text: string;
    source?: string[];
    userMessage: boolean;
}

export interface Keyword {
    keyword: string;
    source: string;
    selected?: boolean;
}

export interface ContentCreationEditorStateIF {
    keywords?: Keyword[];
    name?: string;
    author?: string;
    primaryImageUrl?: string;
}
