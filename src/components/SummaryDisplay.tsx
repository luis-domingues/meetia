import React from 'react';
import { type MeetingSummary } from '../types';
import { PDFService } from '../services/pdf';

interface Props {
    summary: MeetingSummary;
    transcript: string;
}

export const SummaryDisplay: React.FC<Props> = ({ summary, transcript }) => {
    const handleGeneratePDF = ()=> {
        try {
            const pdfBlob = PDFService.generateMeetingSummaryPDF(summary, transcript);
            PDFService.openPDFInNewTab(pdfBlob);
        }
        catch(error) {
            console.error("Erro ao gerar PDF:", error);
            alert('Erro ao gerar PDF. Tente novamente.');
        }
    }
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-2">Resumo</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="mb-4 text-gray-600 whitespace-pre-wrap">{summary.resumo}</p>
            </div>

            {summary.decisoes && summary.decisoes.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Pontos Principais</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {summary.decisoes.map((point, index) => (
                            <li key={index} className="text-sm text-gray-700">{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            {summary.actionItems && summary.actionItems.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Action Items</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {summary.actionItems.map((item, index) => (
                            <li key={index} className="text-sm text-gray-700">{item.responsavel}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={handleGeneratePDF}
                className="w-full bg-blue-800 text-white py-2 px-4 rounded flex items-center justify-center gap-2 font-medium">
                    Gerar PDF
            </button>
        </div>
    );
};