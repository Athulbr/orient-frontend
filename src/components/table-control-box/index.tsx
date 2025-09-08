import { ReactNode, useState } from 'react';
import style from './tabelControlBox.module.css';
import { TableControlBoxPropsIF } from '../../interface/component.interface';
import RefreshIcon from '../../icon-components/RefreshIcon';
import ArrowLeftIcon from '../../icon-components/ArrowLeftIcon';
import { useNavigate } from 'react-router-dom';
import Spinner from '../spinner';

const TableControlBox: React.FC<TableControlBoxPropsIF> = ({ children, tableName, onRefresh, showCacheMessage, showBackButton, loading }) => {
  const navigate = useNavigate();
  const refreshHandler = () => {
    onRefresh && onRefresh();
  };
  return (
    <div className={style.tableControlBox}>
      <div className={style.tableName}>
        {showBackButton && (
          <span className={style.backButton} onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
          </span>
        )}
        {tableName}
      </div>
      <div className={style.tableControl}>
        {showCacheMessage && (
          <div className={style.refreshContainer}>
            <span className={style.cacheMessage}>Showing Cache Data</span>
            <span className={style.iconButton} onClick={refreshHandler}>
              {loading ? <Spinner /> : <RefreshIcon />}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default TableControlBox;
