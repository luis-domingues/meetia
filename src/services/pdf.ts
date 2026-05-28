import jsPDF from 'jspdf';
import { type MeetingSummary } from '../types';

const LINE_HEIGHT_FACTOR = 0.6;
const PDF_BLOB_URL_TTL_MS = 60_000;

export class PDFService {
    static generateMeetingSummaryPDF(summary: MeetingSummary, transcript: string): Blob {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        let y = margin;

        const addText = (text: string, fontSize = 12, bold = false) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, maxWidth) as string[];
            for(const line of lines) {
                if(y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += fontSize * LINE_HEIGHT_FACTOR;
            }
            y += 5;
        };

        doc.setFillColor(13, 71, 161);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Meet.ia - Resumo da reunião', margin, 25);
        y = 50;
        doc.setTextColor(0, 0, 0);

        addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10);
        y += 5;

        addText('RESUMO', 16, true);
        addText(summary.resumo);
        y += 5;

        if(summary.decisoes.length > 0) {
            addText('PONTOS PRINCIPAIS', 16, true);
            summary.decisoes.forEach((point, i) => addText(`${i + 1}. ${point}`));
            y += 5;
        }

        if(summary.actionItems.length > 0) {
            addText('ITENS DE AÇÃO', 16, true);
            summary.actionItems.forEach((item, i) => {
                const deadline = item.prazo ? ` (Prazo: ${item.prazo})` : '';
                addText(`${i + 1}. ${item.responsavel}: ${item.tarefa}${deadline}`);
            });
            y += 5;
        }

        if(transcript.trim()) {
            doc.addPage();
            y = margin;
            addText('TRANSCRIÇÃO COMPLETA', 16, true);
            addText(transcript);
        }

        return doc.output('blob');
    }

    static openPDFInNewTab(blob: Blob): void {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        //delay revocation long enough for the browser to finish loading the document
        setTimeout(() => URL.revokeObjectURL(url), PDF_BLOB_URL_TTL_MS);
    }
}
