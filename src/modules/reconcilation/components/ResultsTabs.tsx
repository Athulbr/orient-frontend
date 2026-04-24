import React from 'react';
import '../styles/ResultsTabs.css';

interface Tab {
  id: string;
  label: string;
  count?: number;
  alert?: boolean;
}

interface ResultsTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const ResultsTabs: React.FC<ResultsTabsProps> = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <div className="results-tabs-container">
      <div className="tabs-header">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button${activeTab === tab.id ? ' active' : ''}${tab.alert ? ' alert' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`tab-count${tab.alert ? ' alert' : ''}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  );
};

export default ResultsTabs;
