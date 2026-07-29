import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck2, Database } from 'lucide-react';
import OrdersTab from './OrdersTab';
import FieldsTab from './FieldsTab';
import { Button } from '../../../../../../components/Button';

const CorrectedOrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'fields'>('orders');
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/agent/scanned-documents')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileCheck2 className="text-blue-600" />
                            Corrected Orders
                        </h1>
                    </div>
                </div>
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg self-start">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        <FileCheck2 size={16} />
                        Corrected Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('fields')}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'fields' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        <Database size={16} />
                        Corrected Fields
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {/* Tab Switcher */}

                {/* Tab Content */}
                <div className="flex-1 bg-white rounded-sm border border-gray-200 flex flex-col overflow-hidden">{activeTab === 'orders' ? <OrdersTab /> : <FieldsTab />}</div>
            </div>
        </div>
    );
};

export default CorrectedOrdersPage;
