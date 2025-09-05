import { useEffect, useState } from 'react';
import style from './transcript.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import TranscriptTableComponent from './table';
import TableControlBox from '../../builders/formbuilder/components/table-control-box';

const TranscriptListPage = () => {
    const navigate = useNavigate();
    const { getTranscripts, transcripts } = useTranscriptGroupStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [firstRender, setFirstRender] = useState(true);
    const [tableRows, setTableRows] = useState('10');
    const [searchText, setSearchText] = useState<string>();

    useEffect(() => {
        const getAllProjects = async () => {
            const res = await getTranscripts(
                {
                    pageSize: tableRows,
                    pageNumber: currentPage,
                    searchText: searchText
                },
                firstRender
            );
            if (res) setFirstRender(false);
        };

        getAllProjects();
    }, [tableRows, currentPage, searchText]);

    useSetTitle();

    return (
        <div className="px-5 w-full">
            <TableControlBox tableName="Transcripts">
                <TableSearch searchText={searchText} setSearchText={setSearchText} />
                <TableRow
                    options={tableRowOptions}
                    row={`${tableRows}`}
                    setRow={size => {
                        setCurrentPage(1);
                        setTableRows(size);
                    }}
                />
                {permissions?.transcript?.create && (
                    <Button onClick={() => navigate('/transcripts/record')} startIcon={<PlusIcon fill="white" />}>
                        Create
                    </Button>
                )}
            </TableControlBox>

            <div className="max-h-[calc(100vh-185px)] overflow-y-scroll">
                <TranscriptTableComponent startIndex={Number(tableRows) * currentPage - Number(tableRows)} />
            </div>

            {!initialLoading && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(total / Number(tableRows))}
                    onPageChange={pageNumber => setCurrentPage(pageNumber)}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default TranscriptListPage;
