import { formatDate } from '../../../../../builders/tablebuilder/render-tablebuilder/utils/formatDate';

export const OnlyDateCustomUI = (row: any) => {
    const date = formatDate(row?.data?.documentDate, true);
    return <div>{date}</div>;
};
