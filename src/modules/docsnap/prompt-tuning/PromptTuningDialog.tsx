import { DatePicker } from '../../../builders/tablebuilder/render-tablebuilder/components/DatePicker';
import { DialogComponent } from '../../../components/DialogComponent';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { TextAreaComponent } from '../../../components/Textarea';
import { usePromptTuningState } from './hooks/promptTuningContext';
import { usePromptTuningApi } from './hooks/usePromptTuningApi';

interface PromptTuningDialogComponentIF {
  test?: string;
}

const PromptTuningDialogComponent: React.FC<PromptTuningDialogComponentIF> = () => {
  const { state, setState } = usePromptTuningState();
  const { fineTunePrompt } = usePromptTuningApi();

  const onDateChange = (from: any, to: any) => {
    setState(prev => ({ ...prev, fromDate: from, toDate: to }));
    const requestBody = {
      templateId: state.selectedTemplateId,
      start_date: `${from.toISOString()}`.split('T')[0],
      end_date: `${to.toISOString()}`.split('T')[0],
      updated_count: 20,
    };

    fineTunePrompt(requestBody);
  };

  return (
    <DialogComponent
      primaryButtonText="Validate"
      secondaryButtonText="Cancel"
      className="max-h-[95vh] w-[80vw]"
      isOpen={state.showTuningDialog}
      name="Prompt Tuning"
      closeDialog={() => setState(prev => ({ ...prev, showTuningDialog: false, fromDate: null, toDate: null, loading: false, fineTunedFieldList: [] }))}
    >
      <div className="flex min-h-140 flex-col gap-4 overflow-hidden p-4 pb-0">
        <div className="flex w-full">
          <DatePicker from={state.fromDate} to={state.toDate} onSubmit={onDateChange} />
        </div>
        {state.loading ? (
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
            <FullScreenLoader text="Fine-Tuning Prompts..." />
          </div>
        ) : state.fineTunedFieldList.length > 0 ? (
          <div className="flex w-full flex-col gap-8 overflow-y-auto p-4">
            {state.fineTunedFieldList.map((field: any, index: number) => (
              <div key={index} className="flex w-full flex-col gap-4 rounded-md border border-gray-300 p-6 shadow-md shadow-gray-400">
                <div className="flex w-full gap-2">
                  <span className="font-semibold text-gray-600">Field Name:</span> {field.field_name}
                </div>
                <TextAreaComponent label="Current Prompt" placeholder="Enter your prompt" value={field.current_prompt} onChange={e => {}} />
                <TextAreaComponent label="Updated Prompt" placeholder="Enter your prompt" value={field.updated_prompt} onChange={e => {}} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center">Please Select Date Range</div>
        )}
      </div>
    </DialogComponent>
  );
};

export default PromptTuningDialogComponent;
