import { create } from "zustand";
import httpRequest from "../global-utils/httpRequest";

export interface transcriptGroupIF {
  _id: string;
  name: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface transcriptGroupPayloadIF {
  name: string;
}

interface RoleState {
  transcripts: transcriptGroupIF[];
  transcript: transcriptGroupIF | null;
  extractedData: any;
  deleting: string;
  loading: boolean;
  initialLoading: boolean;
  createTranscript: (payload: transcriptGroupPayloadIF) => Promise<boolean>;
  updateTranscript: (payload: transcriptGroupPayloadIF, id: string) => Promise<boolean>;
  getTranscripts: (query?: any, noLoader?: boolean) => Promise<boolean>;
  gettranscript: (id: string) => Promise<boolean>;
  deleteTranscript: (id: string) => Promise<boolean>;
  uploadAudio: (payload: FormData) => Promise<boolean>;
  uploadText: (payload: FormData) => Promise<boolean>;
}

const useTranscriptGroupStore = create<RoleState>((set, get) => ({
  transcripts: [],
  transcript: null,
  extractedData: new Blob(),
  deleting: "",
  loading: false,
  initialLoading: false,

  createTranscript: async (payload) => {
    try {
      await httpRequest("POST", `${import.meta.env.VITE_API_URL}/ml/api/audiogroup/create`, payload);
      return true;
    } catch (error) {
      return false;
    }
  },
  updateTranscript: async (payload, id) => {
    try {
      await httpRequest("PATCH", `${import.meta.env.VITE_API_URL}/ml/api/audiogroup/update/${id}`, payload);
      // useToastStore.getState().showToast("success", updateSuccessMessage(""), 50);
      await get().getTranscripts();
      return true;
    } catch (error) {
      return false;
    }
  },
  getTranscripts: async (payload) => {
    set({ initialLoading: true });
    try {
      const res = await httpRequest("POST", `${import.meta.env.VITE_API_URL}/ml/api/audiogroup/`, payload);
      if (!res.data.length) return true;
      set({ transcripts: res.data });
      return true;
    } catch (error) {
      return false;
    } finally {
      set({ initialLoading: false });
    }
  },

  gettranscript: async (id) => {
    set({ loading: true });
    try {
      set({ transcript: null });
      const res = await httpRequest("GET", `${import.meta.env.VITE_API_URL}/ml/api/audiogroup/${id}`);
      set({ transcript: res.data });
      return true;
    } catch (error) {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteTranscript: async (id) => {
    set({ deleting: id });
    try {
      await httpRequest("DELETE", `${import.meta.env.VITE_API_URL}/ml/api/audiogroup/delete/${id}`);
      // useToastStore.getState().showToast("success", deleteSuccessMessage("Record"));
      await get().getTranscripts(); // Refresh after deletion
      return true;
    } catch (error) {
      // useToastStore.getState().showToast("error", deleteErrorMessage("Record"));
      return false;
    } finally {
      set({ deleting: "" });
    }
  },

  uploadAudio: async (formData: FormData): Promise<any> => {
    try {
      const URL = `${import.meta.env.VITE_BASR_URL}/transcript/upload_audio/`;
      const response = await fetch(URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const reader = response?.body?.getReader();
      if (!reader) {
        // showToast('error', 'Error in training the bot');
        return false;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          set({ extractedData: value })
          return value;
        }
        if (done) break;
      }
    } catch (error) {
      console.error('Error in uploadAudio:', error);
      throw error;
    }
  },

  uploadText: async (formData: FormData): Promise<any> => {
    try {
      const URL = `${import.meta.env.VITE_BASR_URL}/transcript/upload_text/`;
      const response = await fetch(URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const reader = response?.body?.getReader();
      if (!reader) {
        // showToast('error', 'Error in training the bot');
        return false;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          set({ extractedData: value })
          return value;
        }
        if (done) break;
      }
    } catch (error) {
      console.error('Error in uploadText:', error);
      throw error;
    }
  }


}));

export default useTranscriptGroupStore;
