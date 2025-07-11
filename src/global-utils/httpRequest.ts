const httpRequest = async <T = any>(method: string, url: string, data: Record<string, any> = {}, token?: string): Promise<T> => {
  const sessionStorageAccessToken = window?.sessionStorage?.getItem('accessToken') || '';
  const normalizedMethod = method.toUpperCase();

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
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
      cache: isReadMethod ? 'no-cache' : 'no-store',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        const errorData = isJson ? await response.json().catch(() => ({})) : {};
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

export default httpRequest;
