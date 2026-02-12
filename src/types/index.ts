export interface CaptionData {
    speaker: string;
    text: string;
    timestamp: number;
}

export interface MeetingSummary {
    resumo: string;
    participantes: string[];
    decisoes: string[];
    actionItems: Array<{
        responsavel: string; 
        tarefa: string; 
        prazo?: string
    }>;
    proximosPassos: string[];
}

export interface StoredMeeting {
    transcript: string;
    summary: MeetingSummary;
    date: string;
}