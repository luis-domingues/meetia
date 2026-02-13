import { useState, useEffect } from "react";
import { OpenAIService } from "../services/openai";
import { storageService } from "../services/storage";
import { type MeetingSummary } from "../types";
import { MeetingControls } from "../components/MeetingControls";
import { SummaryDisplay } from "../components/SummaryDisplay";

export default function Popup() {
    const [savedApiKey, setSavedApiKey] = useState('');
    const [tempApiKey, setTempApiKey] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<MeetingSummary | null>(null);

    useEffect(() => {
        storageService.getApiKey().then(setSavedApiKey);
        storageService.getRecordingState().then(setIsRecording);
    }, []);

    const handleSaveKey = async (key: string)=> {
        await storageService.setApiKey(key);
        setSavedApiKey(key);
        setTempApiKey('');
        alert('API Key salva!');
    }

    const handleStart = async ()=> {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if(tab.id) {
            try {
                const response =  await chrome.tabs.sendMessage(tab.id, {type: 'START_RECORDING'});
                if(response?.success) {
                    setIsRecording(true);
                    await storageService.setRecordingState(true);
                }
            } catch(error) { console.error('error to initialize recording:', error) }
        }
    };

    const handleStop = async ()=> {
        setIsLoading(true);
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if(tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'STOP_RECORDING' }, async (response) => {
                setIsRecording(false);
                await storageService.setRecordingState(false);
                try {
                    const openai = new OpenAIService();
                    await openai.initialize(savedApiKey);
                    const generatedSummary = await openai.generateMeetingSummary(response.transcript);
                    
                    setSummary(generatedSummary);
                    await storageService.saveMeeting(response.transcript, generatedSummary);
                } catch (error) {
                    console.error(error);
                    alert("Erro ao gerar resumo. Verifique sua API Key.");
                } finally {
                    setIsLoading(false);
                }
            });
        }
    };

    return (
        <div className="w-96 p-4 bg-white min-h-[400px]">
            <header className="mb-6 border-b pb-2">
                <h1 className="text-2xl font-bold text-gray-800">Meet.ia</h1>
                <p className="text-xs text-gray-500">AI Assistant for Google Meet</p>
            </header>
            
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

            {summary && <SummaryDisplay summary={summary} />}
        </div>
    );
}