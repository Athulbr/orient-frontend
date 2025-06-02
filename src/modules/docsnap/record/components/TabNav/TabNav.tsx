import React, { useState, useCallback, useRef, useEffect, FC } from 'react';
import styles from './TabNav.module.css';
import { Button } from '../../../../../components/button/Button';
import DropdownMenu from '../../../../../components/DropDownMenu';
import { useViewRecordState } from '../../view-record/hooks/viewRecordContext';

export interface TabNavProps {
  defaultActiveTab?: number;
  className?: string;
  onChange?: (index: number) => void;
  showExportButton?: boolean;
}

export const TabNavComponent: React.FC<TabNavProps> = ({ defaultActiveTab = 0, className = '', onChange, showExportButton }) => {
  // State for tracking active tab
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const tabs = [
    { id: 'data', title: 'Extracted Data' },
    { id: 'chat', title: 'Chat with Document' },
    // { id: 'comment', title: 'Comments' },
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
      <div className="flex flex-1 justify-end gap-2">
        <Button small outlined>
          Request&nbsp;New&nbsp;Field
        </Button>
        <ExportButton showExportButton={showExportButton} />
      </div>
    </nav>
  );
};

interface ExportButtonPropsIF {
  showExportButton?: boolean;
}

const ExportButton: FC<ExportButtonPropsIF> = ({ showExportButton }) => {
  const { state } = useViewRecordState();
  const arrays: any = {};
  state.tableNames.forEach((item, index) => {
    arrays[item] = state.arrayFields[index];
  });
  const extractedData = {
    ...state.topLevelFields,
    ...state.objectFields,
    ...arrays,
  };
  const downloadJSONFile = () => {
    const jsonString = JSON.stringify(extractedData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (!showExportButton) return;
  return (
    <DropdownMenu onChange={downloadJSONFile} options={['XLSX', 'JSON']}>
      <Button small outlined>
        Export
      </Button>
    </DropdownMenu>
  );
};
