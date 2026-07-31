import { config } from '../../../../../../config/default';

const API_BASE = `${config.workflowService}/workflow/corrected-orders`;

const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

export const fetchCorrectedOrders = async (page: number = 1, limit: number = 10, startDate?: string, endDate?: string) => {
    let url = `${API_BASE}?page=${page}&limit=${limit}`;
    if (startDate && endDate) {
        url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const response = await fetch(url, {
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

export const fetchCorrectedFields = async (page: number = 1, limit: number = 10, startDate?: string, endDate?: string) => {
    let url = `${API_BASE}/fields/all?page=${page}&limit=${limit}`;
    if (startDate && endDate) {
        url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const response = await fetch(url, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch corrected fields');
    return response.json();
};

export const fetchFieldOrders = async (fieldId: string, startDate?: string, endDate?: string) => {
    let url = `${API_BASE}/fields/${fieldId}`;
    if (startDate && endDate) {
        url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const response = await fetch(url, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch field orders');
    return response.json();
};

export const fetchExportData = async (tab: 'orders' | 'fields', startDate?: string, endDate?: string) => {
    let url = `${API_BASE}/export/data?tab=${tab}`;
    if (startDate && endDate) {
        url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const response = await fetch(url, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to export data');
    return response.json();
};
