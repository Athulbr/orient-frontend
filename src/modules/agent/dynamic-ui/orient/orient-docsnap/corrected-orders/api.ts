import { config } from '../../../../../../config/default';

const API_BASE = `${config.workflowService}/workflow/corrected-orders`;

const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

export const fetchCorrectedOrders = async (page: number = 1, limit: number = 10) => {
    const response = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch corrected orders');
    return response.json();
};

export const fetchOrderFields = async (orderId: string) => {
    const response = await fetch(`${API_BASE}/${orderId}/fields`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch order fields');
    return response.json();
};

export const fetchCorrectedFields = async (page: number = 1, limit: number = 10) => {
    const response = await fetch(`${API_BASE}/fields/all?page=${page}&limit=${limit}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch corrected fields');
    return response.json();
};

export const fetchFieldOrders = async (fieldId: string) => {
    const response = await fetch(`${API_BASE}/fields/${fieldId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch field orders');
    return response.json();
};
