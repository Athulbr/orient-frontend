import { useNavigate, useParams } from 'react-router-dom';
import TableDeleteButton from '../../../components/table-delete-button';
import convertDateFormat from '../../../utils/functions/convert-date-format';
import Table from '../../../components/table';
import TableHead from '../../../components/table/tableHead';
import TableBody from '../../../components/table/tableBody';
import useAuthStore from '../../../store/authStore';
import { useEffect, useState } from 'react';
import useTranscriptStore, { transcriptIF } from '../../../store/transcriptStore';
import TableControlBox from '../../../components/table-control-box';
import TableSearch from '../../../components/table-search';
import TableRow from '../../../components/table-row';
import { tableRowOptions } from '../../../utils/static-data';

interface PropsIF {
    startIndex?: number;
}

const ListRecords: React.FC<PropsIF> = ({ startIndex = 0 }) => {
    const navigate = useNavigate();
    const { permissions } = useAuthStore();
    const { getTranscripts, transcripts, deleteTranscript, initialLoading, deleting } = useTranscriptStore();
    const [transcriptData, setTranscriptData] = useState<transcriptIF[]>();
    const [currentPage, setCurrentPage] = useState(1);
    const [tableRows, setTableRows] = useState('10');
    const [searchText, setSearchText] = useState<string>();

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getTranscripts({ transcriptGroupId: id });
        }
    }, [id]);

    useEffect(() => {
        if (transcripts) setTranscriptData(transcripts);
    }, [transcripts]);

    const deleteHandler = async (id: string) => {
        const res = await deleteTranscript(id);
        if (res) {
            getTranscripts();
        }
    };

    const rowClickHandler = (e: React.MouseEvent<HTMLTableRowElement>, id: string) => {
        e.stopPropagation();
        navigate(`/transcripts/view/${id}`);
    };

    const tableHead =
        !permissions?.transcript?.update && !permissions?.transcript?.delete
            ? ['SL NO.', 'NAME', 'CREATED ON', 'UPDATED ON']
            : ['SL NO.', 'NAME', 'CREATED ON', 'UPDATED ON', 'ACTION'];

    const tableBody = transcriptData?.map((item, index) => (
        <tr key={index} onClick={e => rowClickHandler(e, item._id)} className="cursor-pointer hover:bg-gray-50">
            <td className="pl-8">{index + startIndex + 1}</td>
            <td className="capitalize">{item?.name}</td>
            <td className="pl-5">{convertDateFormat(item.createdAt)}</td>
            <td className="pl-5">{convertDateFormat(item.updatedAt)}</td>

            {!permissions?.transcript?.update && !permissions?.transcript?.delete ? null : (
                <td className="pl-6 flex gap-2 cursor-pointer">
                    <TableDeleteButton hide={!permissions?.transcript?.delete} name={item.name} id={item._id} onClick={deleteHandler} deleting={deleting} />
                </td>
            )}
        </tr>
    ));

    return (
        <div className="space-y-4">
            <TableControlBox showBackButton tableName="Transcript List">
                <TableSearch searchText={searchText} setSearchText={setSearchText} />
                <TableRow
                    options={tableRowOptions}
                    row={`${tableRows}`}
                    setRow={size => {
                        setCurrentPage(1);
                        setTableRows(size);
                    }}
                />
            </TableControlBox>

            <Table loading={initialLoading} noData={Boolean(!transcriptData?.length)}>
                <TableHead tableHead={tableHead} />
                <TableBody tableBody={tableBody} />
            </Table>
        </div>
    );
};

export default ListRecords;
