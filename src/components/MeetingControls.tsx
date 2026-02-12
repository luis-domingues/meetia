import React from 'react';

interface Props {
    apiKey: string;
    hasSavedKey: boolean;
    isRecording: boolean;
    onSaveKey: (key: string) => void;
    onApiKeyChange: (val: string) => void;
    onStart: () => void;
    onStop: () => void;
    isLoading: boolean;
}

export const MeetingControls: React.FC<Props> = ({ 
    apiKey, 
    hasSavedKey,
    isRecording, 
    onSaveKey,
    onApiKeyChange, 
    onStart, 
    onStop, 
    isLoading 
})=> {
    if(!hasSavedKey) {
        return (
            <div className="flex flex-col gap-2">
                <input 
                    type="password"
                    placeholder="OpenAI API Key"
                    className="w-full p-2 border rounded"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)} 
                />
                <button 
                    onClick={()=> onSaveKey(apiKey)}
                    disabled={!apiKey}
                    className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    Salvar Key
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {!isRecording ? (
                <button 
                    onClick={onStart} 
                    disabled={isLoading} 
                    className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 disabled:opacity-50">
                    {isLoading ? 'Iniciando...' : 'Gravar'}
                </button>
            ) : (
                <button 
                    onClick={onStop} 
                    disabled={isLoading} 
                    className="w-full bg-amber-600 text-white p-3 rounded hover:bg-amber-700 disabled:opacity-50">
                    {isLoading ? 'Resumindo...' : 'Parar e Resumir'}
                </button>
            )}
        </div>
    );
};