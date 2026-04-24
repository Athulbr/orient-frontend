import React, { useState } from 'react';
import '../styles/SheetViewer.css';

interface SheetMetadata {
  [sheetName: string]: {
    rows: number;
    columns: number;
    column_names: string[];
  };
}

interface SheetViewerProps {
  fileName: string;
  sheets: SheetMetadata;
}

const SheetViewer: React.FC<SheetViewerProps> = ({ fileName, sheets }) => {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(
    Object.keys(sheets)[0] || null
  );

  if (!selectedSheet || !sheets[selectedSheet]) {
    return (
      <div className="sheet-viewer">
        <p className="sheet-empty">No sheets available</p>
      </div>
    );
  }

  const sheetData = sheets[selectedSheet];
  const sheetNames = Object.keys(sheets);

  return (
    <div className="sheet-viewer">
      <div className="sheet-viewer-header">
        <span className="sheet-file-name">{fileName}</span>
        <div className="sheet-meta">
          <span>{sheetData.rows} rows</span>
          <span className="sheet-meta-sep">·</span>
          <span>{sheetData.columns} columns</span>
        </div>
      </div>

      <div className="sheet-tabs">
        {sheetNames.map((name) => (
          <button
            key={name}
            className={`sheet-tab${selectedSheet === name ? ' active' : ''}`}
            onClick={() => setSelectedSheet(name)}
          >
            <span className="sheet-tab-name">{name}</span>
            <span className="sheet-tab-count">
              {sheets[name].rows} × {sheets[name].columns}
            </span>
          </button>
        ))}
      </div>

      <div className="sheet-columns">
        <div className="sheet-columns-title">Columns</div>
        <div className="sheet-columns-grid">
          {sheetData.column_names.map((col, idx) => (
            <div key={idx} className="sheet-column-item">
              <span className="sheet-column-index">{idx + 1}</span>
              <span className="sheet-column-name">{col}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SheetViewer;
