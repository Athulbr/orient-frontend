export const config = {
    baseUrl: import.meta.env.VITE_BASE_URL,
    nodeApiUrl: import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_NODE_URL_DEV : import.meta.env.VITE_NODE_URL_DEV,
    mlServicePython: import.meta.env.VITE_ML_SERVICE_PYTHON_DEV,
    mlServiceNodejs: import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_ML_SERVICE_NODEJS_LOCAL : import.meta.env.VITE_ML_SERVICE_NODEJS_DEV
};
// # VITE_AZURE_TENANT_ID=06a2902c-4851-4ece-98d1-46355b6a2003 // Xfactr tenant ID - not applicable for trail user
// # VITE_AZURE_CLIENT_ID=7d47cc25-e855-4901-a822-b3f24fd941c7 # Xfactr client ID
