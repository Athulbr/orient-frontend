import { usePromptTuningState } from './promptTuningContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';

export const usePromptTuningApi = () => {
  const { state, setState } = usePromptTuningState();
  const toast = useToastStore();

  // ============================= GET PROMPTTUNING ==================================

  const fineTunePrompt = async (payload: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_PYTHON_URL}/finetune/prompt_finetune`, payload);
      if (!res.success) {
        setState(prev => ({ ...prev, loading: false }));
        toast.error(res.message);
        return false;
      }
      setState(prev => ({ ...prev, loading: false, fineTunedFieldList: res.data }));
      toast.success('PromptTuning fine-tuned successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      setState(prev => ({ ...prev, loading: false }));
      toast.error('Failed to fine-tune PromptTuning');
    }
  };

  const updateTemplateApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/updated-field/update/prompt/${state.selectedTemplateId}`, requestBody);
      setState(prev => ({ ...prev, showTuningDialog: false, id: '', templateName: '', selectedTemplateId: '' }));
      toast.success('Template updated successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Template');
    }
  };

  return { fineTunePrompt, updateTemplateApi };
};
