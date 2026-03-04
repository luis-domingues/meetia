import jsPDF from 'jspdf';
import { type MeetingSummary } from '../types';

export class PDFService {
    static generateMeetingSummaryPDF(summary: MeetingSummary, transcript: string): Blob {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line:string) => {
                if(yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += fontSize * 0.5;
            });
            yPosition += 5;
        };

        //here contains the pdf settings
        doc.setFillColor(13, 71, 161);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Meet.ia - Resumo da reunião', margin, 25);
        yPosition = 50;
        doc.setTextColor(0, 0, 0);

        addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10, false); //date in brazilian format, but it can be changed to any other format
        yPosition += 5;

        addText('RESUMO', 16, true);
        addText(summary.resumo, 12, false);
        yPosition += 5;
        if(summary.decisoes && summary.decisoes.length > 0) {
            addText('PONTOS PRINCIPAIS', 16, true);
            summary.decisoes.forEach((point, index) => {addText(`${index + 1}. ${point}`, 12, false)});
            yPosition += 5;
        }

        if(summary.actionItems && summary.actionItems.length > 0) {
            addText('ITENS DE AÇÃO', 16, true);
            summary.actionItems.forEach((item, index) => {addText(`${index + 1}. ${item}`, 12, false)});
            yPosition += 5;
        }

        if(transcript && transcript.trim()) {
            doc.addPage();
            yPosition = margin;
            addText('TRANSCRIÇÃO COMPLETA', 16, true);
            addText(transcript, 12, false);
        }

        return doc.output('blob');
    }

    static openPDFInNewTab(blob: Blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        //just to revoke the object url after a short delay to free up memory
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
}