import React from 'react';
import { type MeetingSummary } from '../types';

export const SummaryDisplay: React.FC<{ summary: MeetingSummary }> = ({ summary }) => {
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-2">Resumo</h3>
            <p className="mb-4 text-gray-600">{summary.resumo}</p>

            <h3 className="font-bold text-gray-800 mb-2">Action Items</h3>
            <ul className="space-y-2">
                {summary.actionItems.map((item, i) => (
                    <li key={i} className="flex gap-2 bg-white p-2 rounded border">
                        <span className="font-semibold text-blue-600">{item.responsavel}:</span>
                        <span>{item.tarefa}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};