import { useToastStore } from '../../../../../components/toast/ToastStore';

interface GeneratePromptRequest {
    userInstruction: string;
    currentPrompt?: string;
    fields: any[];
}

// Dummy delay to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePromptApi = () => {
    const toast = useToastStore();

    const generatePromptWithAI = async (requestBody: GeneratePromptRequest): Promise<string | null> => {
        try {
            // TODO: Replace with actual API call
            // const res = await httpRequest('POST', `${config.mlServiceNodejs}/prompt/generate`, requestBody);
            // return res.data?.prompt;

            await delay(1500);

            // If a current prompt exists, refine it; otherwise generate fresh
            if (requestBody.currentPrompt?.trim()) {
                return `${requestBody.currentPrompt}

## Additional Instructions
${requestBody.userInstruction}`;
            }

            const fieldNames = requestBody.fields
                .map(section => section.name || section.jsonKey)
                .filter(Boolean)
                .join(', ');

            return `You are an intelligent document data extraction assistant. Your task is to accurately extract structured data from the provided document.

## Instructions
${requestBody.userInstruction}

## Extraction Guidelines
- Extract data for the following sections: ${fieldNames || 'as defined in the schema'}
- For each field, follow the specific extraction instructions provided in the schema.
- If a field value is not found in the document, return null.
- Ensure accuracy by cross-referencing extracted values with surrounding context.
- Maintain consistent formatting across all extracted fields.

## Output Format
Return the extracted data as a valid JSON object matching the provided schema structure.
Do not include any additional text or explanations outside the JSON output.`;
        } catch (error: any) {
            toast.error('Failed to generate prompt');
            return null;
        }
    };

    return { generatePromptWithAI };
};
