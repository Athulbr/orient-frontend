import clientLogger from "./clientLog";

const httpRequest = async <T = any>(method: string, url: string, data: Record<string, any> = {}, token?: string): Promise<T> => {
    const sessionStorageAccessToken = window?.sessionStorage?.getItem('accessToken') || '';
    const selectedTenant = window?.sessionStorage?.getItem('selectedTenant') || '';
    const user: any = window?.sessionStorage?.getItem('user') || '';
    const normalizedMethod = method.toUpperCase();


    const headers: HeadersInit = {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        tenantid: selectedTenant ? selectedTenant : user?.tenant?.name,
    };

    if (sessionStorageAccessToken) {
        headers.authorization = `Bearer ${JSON.parse(sessionStorageAccessToken)}`;
    }
    if (token) {
        headers.authorization = `Bearer ${token}`;
    }

    const isReadMethod = ['GET', 'HEAD'].includes(normalizedMethod);

    try {
        const options: RequestInit = {
            method: normalizedMethod,
            headers,
            credentials: 'same-origin',
            body: isReadMethod ? undefined : JSON.stringify(data),
            cache: isReadMethod ? 'no-cache' : 'no-store'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            // Parse the body as JSON
            const result = await response.json();

            if (response?.status === 403) {
                clientLogger('POST', `${import.meta.env.VITE_NODE_URL}/log-client-error`, { error: result.message, data: { url: response?.url } })
                throw new Error(`Connection error, try again later`);
            }

            if (response?.status === 404) {
                clientLogger('POST', `${import.meta.env.VITE_NODE_URL}/log-client-error`, { error: response?.statusText, data: { url: response?.url } })
                throw new Error(`Connection error, try again later`);
            }

            if (response?.status === 504) {
                clientLogger('POST', `${import.meta.env.VITE_NODE_URL}/log-client-error`, { error: response?.statusText, data: { url: response?.url } })
                throw new Error(`${response?.statusText}`);
            }

            if (response?.status === 500) {
                clientLogger('POST', `${import.meta.env.VITE_NODE_URL}/log-client-error`, { error: response?.statusText, data: { url: response?.url } })
                const errorMessage = response?.statusText === "" ? "Connection issue, try again later" : response?.statusText;
                throw new Error(errorMessage);
            }

            clearTimeout(timeoutId);

            if (!response?.ok) {
                const contentType = response?.headers.get('content-type');
                const isJson = contentType?.includes('application/json');

                const errorData = isJson ? await response?.json().catch(() => ({})) : {};
                throw new Error(errorData.message || `Request failed with status ${response?.status}`);
            }

            return (await result) as T;
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error) {
        console.log('Error in httpRequest:', error);

        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
};

export default httpRequest;
