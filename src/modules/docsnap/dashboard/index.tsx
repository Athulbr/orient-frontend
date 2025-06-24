import { Search } from 'lucide-react';
import { Button } from '../../../components/Button';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { ButtonBox } from '../../../components/ButtonBox';
import { RecordStatusCustomUI } from '../record/list-record/components/RecordStatusCustomUI';

interface DashboardPageIF {
  test?: string;
}

const DashboardPage: React.FC<DashboardPageIF> = () => {
  const customFunctions = {
    rowClickHandler: (row: any) => {
      //   navigate(`/docsnap/record/view/${row._id}`);
    },
    deleteClickHandler: (row: any) => {},
  };
  const customUI = {
    recordStatus: RecordStatusCustomUI,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <HeaderComponent />
      <div className="flex flex-1 gap-4 overflow-y-auto">
        <div className="flex flex-1 flex-col overflow-y-auto py-1">
          <div className="flex items-center justify-between px-1">
            <h5 className="font-semibold">Recent Files</h5>
            <Button outlined>Start Reviewing</Button>
          </div>
          <UseTablebuilder
            customUI={customUI}
            externalFilters={{ deleted: false }}
            fluidHeight
            refresh={1}
            name="Recent Files Table"
            customFunctions={customFunctions}
          />
          <ButtonBox className="mt-4 px-1">
            <Button outlined>View All</Button>
          </ButtonBox>
        </div>
        <div className="w-[30%] p-2">
          <div className="flex h-full flex-col items-center rounded-lg border p-4">Status Summary</div>
        </div>
      </div>
      <div className="flex h-30 w-full justify-around">
        <DocumentCardComponent />
        <DocumentCardComponent />
        <DocumentCardComponent />
        <DocumentCardComponent />
        <DocumentCardComponent />
        <DocumentCardComponent />
      </div>
    </div>
  );
};

export default DashboardPage;

const DocumentCardComponent = () => {
  return (
    <div className="flex-1 p-2">
      <div className="flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg border bg-gray-50 hover:shadow-md">Purchase</div>
    </div>
  );
};
const HeaderComponent = () => {
  return (
    <section className="flex w-full items-center justify-end gap-4 px-2">
      <div className="flex max-w-100 flex-1 items-center rounded-md border pl-3">
        <Search className="text-gray-500" size={20} />
        <input className="h-10 flex-1 px-4 text-sm outline-none" placeholder="Search" />
      </div>
      <Button outlined>Create Template</Button>
    </section>
  );
};
