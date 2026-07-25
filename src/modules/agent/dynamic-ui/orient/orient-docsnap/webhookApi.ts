import { config } from '../../../../../config/default';

export interface RetryInterval {
    intervalInSeconds: number;
    maxRetryCount: number;
}

interface TriggerWebhookArgs {
    webhookPath: string;
    body: FormData | string;
    headers?: HeadersInit;
    signal?: AbortSignal;
    retryIntervals?: RetryInterval[];
}

const defaultRetryIntervals: RetryInterval[] = [
    { intervalInSeconds: 1, maxRetryCount: 2 },
    { intervalInSeconds: 2, maxRetryCount: 3 },
    { intervalInSeconds: 5, maxRetryCount: 2 },
    { intervalInSeconds: 10, maxRetryCount: 2 },
    { intervalInSeconds: 20, maxRetryCount: 2 },
    { intervalInSeconds: 30, maxRetryCount: 1 }
];

export const triggerWebhook = async ({ webhookPath, body, headers, signal, retryIntervals = defaultRetryIntervals }: TriggerWebhookArgs): Promise<string> => {
    for (const retryConfig of retryIntervals) {
        for (let i = 0; i < retryConfig.maxRetryCount; i++) {
            const controller = new AbortController();
            let parentSignalListener: (() => void) | null = null;
            
            if (signal) {
                if (signal.aborted) {
                    throw new Error('Request aborted by user');
                }
                parentSignalListener = () => controller.abort();
                signal.addEventListener('abort', parentSignalListener);
            }

            const timeoutId = setTimeout(() => {
                controller.abort();
            }, retryConfig.intervalInSeconds * 1000);

            try {
                const response = await fetch(`${config.workflowService}/workflow/webhooks/trigger/${webhookPath}`, {
                    method: 'POST',
                    headers,
                    body,
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`API response error: ${response.status}`);
                }

                const responseData = await response.json();
                const executionId = responseData?.data?.executionId;

                if (!executionId) {
                    throw new Error('No executionId found in response');
                }

                return executionId;
            } catch (error: any) {
                if (signal?.aborted) {
                    throw error;
                }
                console.warn(`Attempt failed (interval: ${retryConfig.intervalInSeconds}s, attempt: ${i + 1}): ${error.message}`);
            } finally {
                clearTimeout(timeoutId);
                if (signal && parentSignalListener) {
                    signal.removeEventListener('abort', parentSignalListener);
                }
            }
        }
    }

    throw new Error('All retry attempts failed to get a response');
};
