import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTablebuilderSettings } from '../../create-tablebuilder/hooks/useTablebuilderSettingsContext';
import { useTablebuilderState } from '../hooks/useTablebuilderStateContext';
import { useFetchDataFromApi } from '../hooks/useFetchDataFromApi';
import { useEffect, useState } from 'react';
import { Button } from '../../../../components/button/Button';

export function TableFooter() {
  return (
    <div className="flex flex-wrap-reverse items-center justify-between gap-2">
      <DocumentsDetails />
      <SelectedDocumentsCount />
      <PaginationComponent />
    </div>
  );
}

// ============================================================================================================================================

const DocumentsDetails = () => {
  const { settings, state } = useTablebuilderState();
  const { pagination } = settings;
  const { total, page, pageRows } = state;

  if (!pagination.showPaginaion || total === 0) return null;

  if (!pagination.showPaginaionDetails) return <div className="w-47"></div>;

  const start = total > 0 ? (page - 1) * pageRows + 1 : 0;
  const end = Math.min(page * pageRows, total);

  return (
    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
      <span className="font-medium">
        Showing&nbsp;{start}&nbsp;to&nbsp;{end}&nbsp;of&nbsp;{total}
        &nbsp;results
      </span>
    </div>
  );
};

// ============================================================================================================================================

const SelectedDocumentsCount = () => {
  const { state, settings } = useTablebuilderState();

  if (state.selectedIds.length === 0 || !settings.rowSelection.showSelectedRowCount) return null;

  return (
    <div className="mt-2 text-sm text-gray-500">
      Selected&nbsp;Documents:&nbsp;
      <span className="text-blue-400">{state.selectedIds.length}</span>
    </div>
  );
};

// ============================================================================================================================================

const PaginationComponent = () => {
  const { state, settings, setState } = useTablebuilderState();
  const { getDataFromApi } = useFetchDataFromApi();
  const [showPopUp, setShowPopUp] = useState(false);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative.mt-2.flex.items-center.gap-2')) {
      setShowPopUp(false);
    }
  };

  useEffect(() => {
    if (showPopUp) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopUp]);

  const { total, page, pageRows } = state;
  const { pagination } = settings;

  if (!pagination.showPaginaion || total === 0) return null;

  const totalPages = Math.ceil(total / pageRows);

  const setPage = (pageNumber: number) => {
    setState(prev => ({ ...prev, page: pageNumber }));
    getDataFromApi({ page: pageNumber });
  };

  return (
    <div className="relative mt-2 flex items-center gap-2">
      {showPopUp && (
        <div className="absolute right-0 bottom-11 grid w-full grid-cols-5 gap-2 rounded-lg border bg-white p-4">
          {Array.from({ length: Math.ceil(190 / pageRows) }, (_, index) => (
            <Button
              outlined
              key={index}
              onClick={() => {
                setPage(index + 1);
                setShowPopUp(false);
              }}
              className={page === index + 1 ? 'border-gray-300 !bg-gray-200' : ''}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}
      <PaginationButton onClick={() => setPage(1)} disabled={page === 1} icon={<ChevronsLeft className="h-4 w-4" />} />
      <PaginationButton onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} icon={<ChevronLeft className="h-4 w-4" />} />
      <span onMouseEnter={() => setShowPopUp(true)} className="cursor-pointer rounded-lg border-1 border-gray-100 px-4 py-2 text-sm hover:bg-gray-50">
        Page {page} of {totalPages}
      </span>
      <PaginationButton onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} icon={<ChevronRight className="h-4 w-4" />} />
      <PaginationButton onClick={() => setPage(totalPages)} disabled={page >= totalPages} icon={<ChevronsRight className="h-4 w-4" />} />
    </div>
  );
};

type PaginationButtonProps = {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
};

const PaginationButton: React.FC<PaginationButtonProps> = ({ onClick, disabled, icon }) => (
  <button className="cursor-pointer rounded-lg border p-2 hover:bg-gray-200 disabled:opacity-50" onClick={onClick} disabled={disabled}>
    {icon}
  </button>
);
