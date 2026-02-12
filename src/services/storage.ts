import { type MeetingSummary, type StoredMeeting } from "../types";

export const storageService = {
    getApiKey: (): Promise<string> => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['openai_key'], (result: {openai_key?: string}) => {
                resolve(result.openai_key || '');
            });
        });
    },

    setApiKey: (key: string): Promise<void> => {
        return chrome.storage.local.set({ openai_key: key });
    },

    saveMeeting: (transcript: string, summary: MeetingSummary): Promise<void> => {
        const key = `meeting_${Date.now()}`;
        const data: StoredMeeting = {
            transcript,
            summary,
            date: new Date().toISOString(),
        };
        return chrome.storage.local.set({ [key]: data });
    }
};