import { useState } from 'react';
import { type MeetingSummary } from '../types';
import { PDFService } from '../services/pdf';

interface Props {
    summary: MeetingSummary;
    transcript: string;
}

export const SummaryDisplay = ({ summary, transcript }: Props) => {
    const [includeTranscript, setIncludeTranscript] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const handleGeneratePDF = () => {
        setPdfError(null);
        try {
            const blob = PDFService.generateMeetingSummaryPDF(summary, includeTranscript ? transcript : '');
            PDFService.openPDFInNewTab(blob);
        } catch (error) {
            console.error('PDF generation failed:', error);
            setPdfError('Erro ao gerar PDF. Tente novamente.');
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-2">Resumo</h3>
            <div className="bg-white p-4 rounded-lg mb-4 border border-gray-100">
                <p className="text-gray-600 whitespace-pre-wrap">{summary.resumo}</p>
            </div>

            {summary.participantes.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Participantes</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {summary.participantes.map((participante) => (
                            <li key={participante} className="text-gray-700">{participante}</li>
                        ))}
                    </ul>
                </div>
            )}

            {summary.decisoes.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Pontos Principais</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {summary.decisoes.map((point, i) => (
                            <li key={i} className="text-gray-700">{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            {summary.actionItems.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Itens de Ação</h4>
                    <ul className="list-disc list-inside space-y-2">
                        {summary.actionItems.map((item, i) => (
                            <li key={i} className="text-gray-700">
                                <span className="font-medium">{item.responsavel}:</span> {item.tarefa}
                                {item.prazo && (
                                    <span className="text-gray-500 text-xs ml-2">(Prazo: {item.prazo})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {summary.proximosPassos.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Próximos Passos</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {summary.proximosPassos.map((passo, i) => (
                            <li key={i} className="text-gray-700">{passo}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mb-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeTranscript}
                        onChange={(e) => setIncludeTranscript(e.target.checked)}
                        className="w-4 h-4 border-gray-300"
                    />
                    Incluir transcrição completa no PDF
                </label>
            </div>

            {pdfError && (
                <p className="mb-2 text-xs text-red-600">{pdfError}</p>
            )}

            <button
                onClick={handleGeneratePDF}
                className="w-full bg-blue-800 text-white py-2 px-4 rounded flex items-center justify-center gap-2 font-medium hover:bg-blue-900"
            >
                Gerar PDF
            </button>
        </div>
    );
};
