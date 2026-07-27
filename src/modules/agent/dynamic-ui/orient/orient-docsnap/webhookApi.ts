import { config } from '../../../../../config/default';
import clientLoggerNew from '../../../../../global-utils/clientLoggerNew';

export interface RetryInterval {
    intervalInSeconds: number;
    maxRetryCount: number;
}

interface TriggerWebhookArgs {
    webhookPath: string;
    body: FormData | string;
    headers?: HeadersInit;
    retryIntervals?: RetryInterval[];
}

const defaultRetryIntervals: RetryInterval[] = [
    { intervalInSeconds: 2, maxRetryCount: 10 },
    { intervalInSeconds: 5, maxRetryCount: 10 },
    { intervalInSeconds: 20, maxRetryCount: 2 },
    { intervalInSeconds: 30, maxRetryCount: 1 }
];

export const triggerWebhook = async ({ webhookPath, body, headers, retryIntervals = defaultRetryIntervals }: TriggerWebhookArgs): Promise<string> => {
    let totalAttempts = 0;
    const startTime = Date.now();

    for (const retryConfig of retryIntervals) {
        for (let i = 0; i < retryConfig.maxRetryCount; i++) {
            totalAttempts++;
            const controller = new AbortController();

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

                if (totalAttempts > 1) {
                    const totalTimeElapsedMs = Date.now() - startTime;
                    const summary = {
                        webhookPath,
                        totalAttempts,
                        totalTimeElapsedMs,
                        totalTimeElapsedSeconds: (totalTimeElapsedMs / 1000).toFixed(2),
                        retryIntervalsConfig: retryIntervals.map(r => `${r.maxRetryCount} attempts @ ${r.intervalInSeconds}s`).join(', ')
                    };
                    clientLoggerNew({
                        error: `[ ${webhookPath} ] Webhook trigger succeeded after retries`,
                        data: {
                            summary,
                            body
                        }
                    });
                }

                return executionId;
            } catch (error: any) {
                // Ignore error and continue to the next retry attempt
            } finally {
                clearTimeout(timeoutId);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    const totalTimeElapsedMs = Date.now() - startTime;
    const summary = {
        webhookPath,
        totalAttempts,
        totalTimeElapsedMs,
        totalTimeElapsedSeconds: (totalTimeElapsedMs / 1000).toFixed(2),
        retryIntervalsConfig: retryIntervals.map(r => `${r.maxRetryCount} attempts @ ${r.intervalInSeconds}s`).join(', ')
    };

    clientLoggerNew({
        error: `[ ${webhookPath} ] Webhook trigger failed, still pending after retrying multiple times`,
        data: {
            summary,
            body
        }
    });
    throw new Error('All retry attempts failed to trigger webhook');
};
