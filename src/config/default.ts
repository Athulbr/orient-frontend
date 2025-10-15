export const config = {
    baseUrl: import.meta.env.VITE_BASE_URL,
    nodeApiUrl: import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_NODE_URL_DEV : import.meta.env.VITE_NODE_URL_DEV,
    extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_DEV,
    chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_DEV,
    mlServiceNodejs:
        import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_AI_SERVICE_NODEJS_LOCAL : import.meta.env.VITE_AI_SERVICE_NODEJS_DEV,
    azure: {
        tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID
    },
    google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
    }
};
