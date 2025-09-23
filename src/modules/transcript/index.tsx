import { useEffect, useState } from 'react';
import style from './transcript.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import { Button } from '../../components/Button';
import { PlusIcon } from 'lucide-react';
import TableSearch from '../../components/table-search';
import TableControlBox from '../../components/table-control-box';
import { tableRowOptions } from '../../global-utils/static-data';
import { UseTablebuilder } from '../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';

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

    // useSetTitle();

    return (
        <div className="px-5 w-full">
            <UseTablebuilder
                name="List Transcript Table"
                fluidHeight
                // refresh={state.refresh}
                // customFunctions={customFunctions}
                // customUI={customUI}
                // actionButtons={actionButtons}
                deletePermission="delete:project"
                updatePermission="update:project"
            />
        </div>
    );
};

export default TranscriptListPage;
