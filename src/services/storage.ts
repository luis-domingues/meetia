import { type MeetingSummary, type StoredMeeting } from '../types';

function storageGet<T extends Record<string, unknown>>(keys: string[]): Promise<T> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (result) => {
            if(chrome.runtime.lastError) 
                reject(new Error(chrome.runtime.lastError.message));
            else 
                resolve(result as T);
        });
    });
}

export const storageService = {
    async getApiKey(): Promise<string> {
        const result = await storageGet<{ openai_key?: string }>(['openai_key']);
        return result.openai_key ?? '';
    },

    setApiKey(key: string): Promise<void> {
        return chrome.storage.local.set({ openai_key: key });
    },

    setRecordingState(isRecording: boolean): Promise<void> {
        return chrome.storage.local.set({ is_recording: isRecording });
    },

    async getRecordingState(): Promise<boolean> {
        const result = await storageGet<{ is_recording?: boolean }>(['is_recording']);
        return result.is_recording ?? false;
    },

    saveMeeting(transcript: string, summary: MeetingSummary): Promise<void> {
        const key = `meeting_${Date.now()}`;
        const data: StoredMeeting = {
            transcript,
            summary,
            date: new Date().toISOString(),
        };
        return chrome.storage.local.set({ [key]: data });
    },
};
