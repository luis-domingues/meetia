import { useState, useEffect } from 'react';
import { OpenAIService } from '../services/openai';
import { storageService } from '../services/storage';
import { type MeetingSummary, type AppNotification } from '../types';
import { MeetingControls } from '../components/MeetingControls';
import { SummaryDisplay } from '../components/SummaryDisplay';
import { MessageType } from '../constants/messages';

type MeetTab = chrome.tabs.Tab & { id: number };

function isMeetTab(tab: chrome.tabs.Tab): tab is MeetTab {
    return typeof tab.id === 'number' && (tab.url?.includes('meet.google.com') ?? false);
}

function describeError(error: unknown): string {
    if(error instanceof Error) {
        const msg = error.message;
        if(msg.includes('Could not establish connection') || msg.includes('No meet tab'))
            return 'Abra o Google Meet e recarregue a página antes de gravar.';
    
        if(msg.includes('401') || msg.includes('Invalid API key') || msg.includes('Incorrect API key')) 
            return 'API Key inválida. Verifique suas configurações.';
        
        if(msg.includes('429') || msg.includes('rate_limit')) 
            return 'Limite de requisições atingido. Aguarde um momento e tente novamente.';
        
        if(msg.includes('insufficient_quota')) 
            return 'Cota da API esgotada. Verifique sua conta OpenAI.';
        
        if(msg.includes('Empty response')) 
            return 'O modelo não retornou um resumo. Tente novamente.';
        
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
}

export default function Popup() {
    const [savedApiKey, setSavedApiKey] = useState('');
    const [tempApiKey, setTempApiKey] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<MeetingSummary | null>(null);
    const [transcript, setTranscript] = useState('');
    const [notification, setNotification] = useState<AppNotification | null>(null);

    useEffect(() => {
        Promise.all([
            storageService.getApiKey(),
            storageService.getRecordingState(),
        ]).then(([key, recording]) => {
            setSavedApiKey(key);
            setIsRecording(recording);
        }).catch(console.error);
    }, []);

    const notify = (message: string, variant: AppNotification['variant'] = 'info') => {
        setNotification({ message, variant });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSaveKey = async (key: string) => {
        await storageService.setApiKey(key);
        setSavedApiKey(key);
        setTempApiKey('');
        notify('API Key salva com sucesso!', 'success');
    };

    const handleStart = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if(!isMeetTab(tab)) {
                notify('Abra o Google Meet para iniciar a gravação.', 'error');
                return;
            }
            const response = await chrome.tabs.sendMessage(tab.id, { type: MessageType.START_RECORDING });
            if(response?.success) {
                setIsRecording(true);
                await storageService.setRecordingState(true);
            }
        } catch (error) {
            console.error('Failed to start recording:', error);
            notify(describeError(error), 'error');
        }
    };

    const handleStop = async () => {
        setIsLoading(true);
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if(!isMeetTab(tab)) throw new Error('No meet tab');

            const response = await chrome.tabs.sendMessage<unknown, { transcript: string }>(
                tab.id,
                { type: MessageType.STOP_RECORDING },
            );

            setIsRecording(false);
            await storageService.setRecordingState(false);

            const openai = new OpenAIService();
            openai.initialize(savedApiKey);
            const generatedSummary = await openai.generateMeetingSummary(response.transcript);

            setSummary(generatedSummary);
            setTranscript(response.transcript);
            await storageService.saveMeeting(response.transcript, generatedSummary);
        } catch (error) {
            console.error('Failed to process recording:', error);
            notify(describeError(error), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-96 p-4 bg-white min-h-[400px]">
            <header className="mb-6 border-b pb-2">
                <h1 className="text-2xl font-bold text-gray-800">Meet.ia</h1>
                <p className="text-xs text-gray-500">AI Assistant for Google Meet</p>
            </header>

            {notification && (
                <div className={`mb-3 px-3 py-2 rounded text-sm border ${
                    notification.variant === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : notification.variant === 'error'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                    {notification.message}
                </div>
            )}

            <MeetingControls
                apiKey={tempApiKey}
                hasSavedKey={!!savedApiKey}
                isRecording={isRecording}
                isLoading={isLoading}
                onApiKeyChange={setTempApiKey}
                onSaveKey={handleSaveKey}
                onStart={handleStart}
                onStop={handleStop}
            />

            {summary && <SummaryDisplay summary={summary} transcript={transcript} />}
        </div>
    );
}
