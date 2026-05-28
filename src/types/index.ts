export interface CaptionData {
    speaker: string;
    text: string;
    timestamp: number;
}

export interface ActionItem {
    responsavel: string;
    tarefa: string;
    prazo?: string;
}

export interface MeetingSummary {
    resumo: string;
    participantes: string[];
    decisoes: string[];
    actionItems: ActionItem[];
    proximosPassos: string[];
}

export interface StoredMeeting {
    transcript: string;
    summary: MeetingSummary;
    date: string;
}

export type NotificationVariant = 'success' | 'error' | 'info';

export interface AppNotification {
    message: string;
    variant: NotificationVariant;
}
