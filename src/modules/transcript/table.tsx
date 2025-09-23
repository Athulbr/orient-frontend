import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useTranscriptGroupStore, { transcriptGroupIF } from '../../zustand-store/transcriptGroupStore';
import convertDateFormat from '../../global-utils/convert-date-format';
import TableDeleteButton from '../../components/table-delete-button';
import { Pencil, Eye } from 'lucide-react';
import Table from '../../components/table';
import TableHead from '../../components/table/tableHead';
import TableBody from '../../components/table/tableBody';

interface PropsIF {
    startIndex: number;
}

const TranscriptTableComponent: React.FC<PropsIF> = ({ startIndex }) => {
    const navigate = useNavigate();
    const { getTranscripts, transcripts, deleteTranscript, initialLoading, deleting } = useTranscriptGroupStore();
    const [transcriptData, setTranscriptData] = useState<transcriptGroupIF[]>();

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
        navigate(`/transcripts/create/${id}`);
    };
    const editClickHandler = (e: React.MouseEvent<HTMLTableRowElement>, id: string) => {
        e.stopPropagation();
        navigate(`/transcripts/record/${id}`);
    };

    const viewClickHandler = (e: React.MouseEvent<HTMLTableRowElement>, id: string) => {
        e.stopPropagation();
        navigate(`/transcripts/list/${id}`);
    };

    const tableHead = ['SL NO.', 'NAME', 'CREATED ON', 'UPDATED ON', 'ACTION'];

    const tableBody = transcriptData?.map((item, index) => (
        <tr key={index} onClick={e => rowClickHandler(e, item._id)} className="cursor-pointer hover:bg-gray-50">
            <td className="pl-8">{index + startIndex + 1}</td>

            <td className="capitalize">{item.name}</td>
            <td className="pl-5">{convertDateFormat(item.createdAt)}</td>
            <td className="pl-5">{convertDateFormat(item.updatedAt)}</td>
            <td className={`flex gap-1 pl-6cursor-pointer`}>
                <span onClick={(e: React.MouseEvent<HTMLTableRowElement>) => editClickHandler(e, item._id)}>
                    <Pencil />
                </span>
                <TableDeleteButton hide={false} name={item.name} id={item._id} onClick={deleteHandler} deleting={deleting} />
                {/* Tooltip */}
                <span
                    className="relative inline-block cursor-pointer group"
                    onClick={(e: React.MouseEvent<HTMLTableRowElement>) => viewClickHandler(e, item._id)}
                >
                    <Eye />
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                    </span>
                </span>
            </td>
        </tr>
    ));

    return (
        <div>
            <Table loading={initialLoading} noData={Boolean(!transcriptData?.length)}>
                <TableHead tableHead={tableHead} />
                <TableBody tableBody={tableBody} />
            </Table>
        </div>
    );
};

export default TranscriptTableComponent;
