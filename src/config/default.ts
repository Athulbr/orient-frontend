const globalEnv: any = {
    local: {
        baseUrl: import.meta.env.VITE_BASE_URL_LOCAL || 'http://localhost:27017/makez-new',
        nodeApiUrl: import.meta.env.VITE_NODE_URL_LOCAL || 'http://localhost:4000',
        extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_LOCAL || 'http://localhost:4000',
        chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_LOCAL,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_LOCAL || 'http://localhost:4000'
    },
    development: {
        baseUrl: import.meta.env.VITE_BASE_URL_DEV,
        nodeApiUrl: import.meta.env.VITE_NODE_URL_DEV,
        extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_DEV,
        chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_DEV,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_DEV,
        workflowService: import.meta.env.VITE_WORKFLOW_SERVICE_DEV
    },
    production: {
        baseUrl: import.meta.env.VITE_BASE_URL_PROD,
        nodeApiUrl: import.meta.env.VITE_NODE_URL_PROD,
        extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_PROD,
        chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_PROD,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_PROD,
        workflowService: import.meta.env.VITE_WORKFLOW_SERVICE_PROD
    },
    vinayak_local: {
        baseUrl: import.meta.env.VITE_BASE_URL_DEV,
        nodeApiUrl: import.meta.env.VITE_NODE_URL_DEV,
        extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_DEV,
        chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_DEV,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_LOCAL,
        workflowService: import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL
    },
    rehab: {
        baseUrl: import.meta.env.VITE_BASE_URL_REHAB,
        nodeApiUrl: import.meta.env.VITE_NODE_URL_REHAB,
        extractionServicePython: import.meta.env.VITE_EXTRACTION_SERVICE_PYTHON_REHAB,
        chatbotServicePython: import.meta.env.VITE_CHATBOT_SERVICE_PYTHON_REHAB,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_REHAB
    },
    orient: {
        baseUrl: import.meta.env.VITE_BASE_URL_ORIENT,
        nodeApiUrl: import.meta.env.VITE_NODE_URL_ORIENT,
        mlServiceNodejs: import.meta.env.VITE_AI_SERVICE_NODEJS_ORIENT,
        workflowService: import.meta.env.VITE_WORKFLOW_SERVICE_ORIENT
    }
};
const envConfig: any = globalEnv[import.meta.env.VITE_NODE_ENV || 'local'];

export const config = {
    baseUrl: envConfig.baseUrl,
    nodeApiUrl: envConfig.nodeApiUrl,
    workflowService: envConfig.workflowService,
    extractionServicePython: envConfig.extractionServicePython,
    chatbotServicePython: envConfig.chatbotServicePython,
    mlServiceNodejs: envConfig.mlServiceNodejs
};
