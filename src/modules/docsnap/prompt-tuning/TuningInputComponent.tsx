import { useState } from 'react';
import { llmModels, llmProviders } from './StaticData';
import { UpdatedFieldsIF } from './interface';
import { Loader } from 'lucide-react';
import httpRequest from '../../../utils/httpRequest';
import { ButtonBox } from '../../../components/ButtonBox';
import { SingleSelect } from '../../../components/SingleSelect';
import { useToastStore } from '../../../components/toast/ToastStore';
import { Button } from '../../../components/Button';
import { TextAreaComponent } from '../../../components/Textarea';
import httpUploadRequest from '../../../utils/httpUploadRequest';
import Spinner from '../../../components/Spinner';

// Constants
const API_ENDPOINT = 'https://dev.makez.ai/ai/api/finetune/v1/prompt/prompt-tune';
const BASED_ON_OPTIONS = [
  { label: 'Edit', value: 'edit' },
  { label: 'Comment', value: 'comment' },
];
const FALLBACK_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

interface TuningInputComponentProps {
  selectedRow: UpdatedFieldsIF | null;
}

interface TuningConfig {
  llm: string;
  model: string;
  basedOn: string;
  fallBack: string;
}

interface LlmResponse {
  updated_schema: string;
  vendor_used: string;
  model_used: string;
  diff_info: {
    removed: string[];
    added: string[];
  };
}

const TuningInputComponent: React.FC<TuningInputComponentProps> = ({ selectedRow }) => {
  const [config, setConfig] = useState<TuningConfig>({
    llm: '',
    model: '',
    basedOn: '',
    fallBack: '',
  });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [llmResponse, setLlmResponse] = useState<LlmResponse | null>(null);

  const toast = useToastStore();

  const updateField = (field: keyof TuningConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'llm' ? { model: '' } : {}), // Reset model when llm changes
    }));
  };

  const validateFields = (): boolean => {
    const requiredFields: { key: keyof TuningConfig; message: string }[] = [
      { key: 'llm', message: 'Please select LLM provider' },
      { key: 'model', message: 'Please select LLM model' },
      { key: 'basedOn', message: 'Please select based on comment or edit' },
      { key: 'fallBack', message: 'Please select allow fallback or not' },
    ];

    for (const { key, message } of requiredFields) {
      if (!config[key]) {
        toast.warning(message, { title: 'Warning' });
        return false;
      }
    }

    if (!selectedRow) {
      toast.warning('No row selected', { title: 'Warning' });
      return false;
    }

    return true;
  };

  const fineTunePrompt = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      const requestBody = {
        present_schema: selectedRow?.presentSchema?.instruction,
        vendor: config.llm,
        based_on: config.basedOn,
        extracted_data: selectedRow?.extractedData,
        data_after_user_edited: selectedRow?.updatedData,
        comment: selectedRow?.comment,
        allow_fallback: config.fallBack === 'yes',
        model_name: config.model,
      };

      const response: any = await httpRequest('POST', API_ENDPOINT, requestBody);

      if (response && response.result) {
        setLlmResponse(response.result);
        toast.success('Fine tuning completed successfully');
      } else {
        toast.error('Failed to get response from server');
      }
    } catch (error) {
      toast.error('An error occurred during fine tuning');
      console.error('Fine tuning error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    const requestBody = {
      document_type: 'purchase_order',
      entity_schema: {
        fields: {
          po_number: {
            type: 'str',
            description: 'Purchase Order Number',
            instruction:
              "Extract PO numbers labeled as 'Order #', 'PO', or 'Purchase Order No.' with no prefixes. If the extracted result is longer than the corrected result provided by the user, consider truncating the excess characters.",
          },
        },
      },
      include_confidence: true,
      include_bbox: true,
      confidence_threshold: 0.8,
      s3_file_name: 'PO_Private_00114126882.pdf',
      provider_id: 'openai',
      model_id: 'gpt-4o',
      use_latest: false,
      ocr_engine: 'doctr',
    };
    const response = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);
    if (response.stream_url) {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai/${response.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

      eventSource.addEventListener('task_update', (event: any) => {
        const data = JSON.parse(event.data);
        if (data.status === 'Complete') {
          setExtracting(false);

          setExtractedData(data?.result?.extracted_data);
        }
      });
      eventSource.onerror = (error: any) => {
        eventSource.close();
        setExtracting(false);
      };
    }
  };

  const renderDiffList = (items: string[]) => {
    if (!items || items.length === 0) return 'None';
    return items.join(', ');
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800">Fine Tuning Configuration</h2>

      {/* LLM Selection */}
      <div className="flex gap-5">
        <SingleSelect placeholder="Select LLM Provider" options={llmProviders} value={config.llm} onValueChange={value => updateField('llm', value)} />
        <div className="w-full">
          {config.llm && (
            <SingleSelect
              placeholder="Select LLM Model"
              // @ts-ignore
              options={llmModels[config.llm] || []}
              value={config.model}
              onValueChange={value => updateField('model', value)}
            />
          )}
        </div>
      </div>

      {/* Configuration Options */}
      <div className="flex gap-5">
        <SingleSelect placeholder="Based on" options={BASED_ON_OPTIONS} value={config.basedOn} onValueChange={value => updateField('basedOn', value)} />
        <div className="w-full">
          <SingleSelect
            placeholder="Allow Fallback"
            options={FALLBACK_OPTIONS}
            value={config.fallBack}
            onValueChange={value => updateField('fallBack', value)}
          />
        </div>
      </div>

      {/* Present Schema Display */}
      <div className="mt-4">
        <div className="mb-2 text-sm text-gray-600">Present Schema</div>
        <div className="min-h-20 w-full rounded-lg border bg-gray-50 p-4 text-sm">{selectedRow?.presentSchema?.instruction || 'No schema selected'}</div>
      </div>

      {/* Fine Tune Button */}
      <ButtonBox className="mt-4">
        <Button className="px-4 py-2" disabled={loading} onClick={fineTunePrompt}>
          {loading ? (
            <span className="flex items-center">
              <Loader size={18} className="mr-2 animate-spin" />
              Processing...
            </span>
          ) : llmResponse ? (
            'Fine Tune Again'
          ) : (
            'Fine Tune'
          )}
        </Button>
      </ButtonBox>

      {/* Response Section */}
      {llmResponse && (
        <>
          <TextAreaComponent
            label="Updated Schema"
            className="font-mono text-sm"
            value={llmResponse.updated_schema}
            onChange={(e: any) => setLlmResponse(prev => (prev ? { ...prev, updated_schema: e.target.value } : null))}
          />

          <div className="mt-4 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">Fine Tuning Results</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-600">Vendor Used:</span> <span className="text-gray-800">{llmResponse.vendor_used}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Model Used:</span> <span className="text-gray-800">{llmResponse.model_used}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Removed:</span>{' '}
                <span className="text-gray-800">{renderDiffList(llmResponse.diff_info?.removed)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Added:</span> <span className="text-gray-800">{renderDiffList(llmResponse.diff_info?.added)}</span>
              </div>
            </div>
          </div>

          <ButtonBox className="mt-4">
            <Button className="px-4 py-2" onClick={handleExtract}>
              {extracting ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Extracting Field
                </span>
              ) : (
                'Extract Field'
              )}
            </Button>
          </ButtonBox>

          {extractedData && <div className="border p-4 text-lg font-semibold text-green-700">po_number: {extractedData.po_number.value}</div>}
        </>
      )}
    </section>
  );
};

export default TuningInputComponent;
