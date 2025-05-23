import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './TabNav.module.css';
import { Button } from '../../../../../components/button/Button';

export interface TabNavProps {
  defaultActiveTab?: number;
  className?: string;
  onChange?: (index: number) => void;
  exportData?: (index: number) => void;
  showExportButton?: boolean;
}

export const TabNavComponent: React.FC<TabNavProps> = ({ defaultActiveTab = 0, className = '', onChange, exportData, showExportButton }) => {
  // State for tracking active tab
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const tabs = [
    { id: 'data', title: 'Extracted Data' },
    { id: 'chat', title: 'Chat with Document' },
    { id: 'comment', title: 'Comments' },
  ];

  // Refs for DOM elements
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Update the indicator position
  const updateTabIndicator = useCallback(() => {
    const activeTabElement = tabsRef.current[activeTab];
    const tabList = tabListRef.current;

    if (activeTabElement && tabList) {
      const tabLeft = activeTabElement.offsetLeft;
      const tabWidth = activeTabElement.offsetWidth;

      requestAnimationFrame(() => {
        tabList.style.setProperty('--tab-left', `${tabLeft}px`);
        tabList.style.setProperty('--tab-width', `${tabWidth}px`);
      });
    }
  }, [activeTab]);

  // Handle tab selection
  const handleTabClick = useCallback(
    (index: number) => {
      setActiveTab(index);
      onChange?.(index);
    },
    [onChange]
  );

  // Update indicator on mount, active tab change, and resize
  useEffect(() => {
    updateTabIndicator();
    window.addEventListener('resize', updateTabIndicator);
    return () => window.removeEventListener('resize', updateTabIndicator);
  }, [updateTabIndicator]);

  return (
    <nav className={`${styles.tabNav} ${className} `}>
      <div ref={tabListRef} role="tablist" className={styles.tabList}>
        {tabs.map((item, index) => (
          <button
            key={item.id}
            // @ts-ignore
            ref={el => (tabsRef.current[index] = el)}
            role="tab"
            aria-selected={activeTab === index}
            id={`tab-${item.id}`}
            className={styles.tab}
            onClick={() => handleTabClick(index)}
            tabIndex={activeTab === index ? 0 : -1}
          >
            {item.title}
          </button>
        ))}
      </div>
      {showExportButton && (
        <div className="flex flex-1 justify-end">
          <span className="cursor-pointer" onClick={() => exportData?.(activeTab)}>
            <Button small outlined>
              Export
            </Button>
          </span>
        </div>
      )}
    </nav>
  );
};
