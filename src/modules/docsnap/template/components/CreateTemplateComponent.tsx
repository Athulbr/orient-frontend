import { Search, CircleChevronRight } from 'lucide-react';
import { DialogComponent } from '../../../../components/DialogComponent';

export const CreateTemplateComponent = ({ state, setState }: any) => {
  if (!state.showCreateTemplateDialog) return null;
  return (
    <DialogComponent
      className="h-[400px] w-[800px]"
      name="Create Template"
      isOpen={state.showCreateTemplateDialog}
      closeDialog={() => setState({ ...state, showCreateTemplateDialog: false })}
      primaryButtonText="Create Template"
    >
      <div className="h-full p-6">
        <div className="flex h-full flex-col gap-6">
          <div className="flex w-full items-center rounded-md border pl-3">
            <Search className="text-gray-500" size={20} />
            <input className="h-10 flex-1 px-4 text-sm outline-none" placeholder="Search" />
          </div>
          <div className="flex h-full w-full flex-wrap gap-x-4">
            {state.templates.map((template: any, idx: number) => (
              <div key={idx} className="flex h-14 w-60 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
                {template.name}
                <CircleChevronRight size={14} className="text-gray-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DialogComponent>
  );
};
