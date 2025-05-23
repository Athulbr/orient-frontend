import { useParams } from 'react-router-dom';
import httpRequest from '../../render-tablebuilder/utils/HttpRequest';
import { useTablebuilderSettings } from './useTablebuilderSettingsContext';
import { useToastStore } from '../../../../components/toast/ToastStore';

export const useFetchCreateTB = () => {
  const { settings, setSettings, builder, setBuilder } = useTablebuilderSettings();
  const { id } = useParams();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createTablebuilderApi = async () => {
    setBuilder(prev => ({ ...prev, loading: true }));
    const tableName = prompt('Please enter table name', '');
    try {
      const res = await httpRequest('POST', 'http://localhost:4600/api/tablebuilder', {
        name: tableName,
        settings,
        description: 'tablebuilder description',
      });
      toast.success('Tablebuilder Created Successfully');
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Create Tablebuilder');
    } finally {
      setBuilder(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================== UPDATE =================================

  const updateTablebuilderApi = async () => {
    setBuilder(prev => ({ ...prev, loading: true }));
    try {
      const res = await httpRequest('PUT', `http://localhost:4600/api/tablebuilder/${id}`, {
        name: builder.name,
        settings,
        description: 'tablebuilder description',
      });
      toast.success('Tablebuilder Updated Successfully');
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Update Tablebuilder');
    } finally {
      setBuilder(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================= GET ==================================

  const getTablebuilderByIdApi = async () => {
    try {
      const res = await httpRequest('GET', `http://localhost:4600/api/tablebuilder/${id}`);
      setSettings(res.data.settings);
      setBuilder(prev => ({ ...prev, name: res.data.name }));
      toast.success('Fetched Tablebuilder List Successfully');
    } catch (error) {
      toast.error('Failed to Fetch Tablebuilder List');
      console.log('error:===========', error);
    }
  };

  // ===============================================================

  //   const generateTablebuilderWithAiApi = async () => {
  //     if (!input) return;
  //     setLoading(true);
  //     try {
  //       const response = await httpRequest('POST', 'http://localhost:4000/generate-table-settings', { prompt });
  //       const parsedJson: any = safeJsonParse(response.data);

  //       if (!parsedJson) {
  //         throw new Error('Failed to parse AI response');
  //       }
  //       const finalData: TablebuilderSettingsIF = parsedJson;
  //       console.log('AI parsedJson:', finalData);
  //       setSettings(finalData);
  //     } catch (error) {
  //       console.error('Error in sendPrompt:', error);
  //       alert(error instanceof Error ? error.message : 'An error occurred');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  return { createTablebuilderApi, getTablebuilderByIdApi, updateTablebuilderApi };
};
