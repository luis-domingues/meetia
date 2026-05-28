import OpenAI from 'openai';
import { type MeetingSummary } from '../types';

export class OpenAIService {
    private client: OpenAI | null = null;

    initialize(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }

    async generateMeetingSummary(transcript: string): Promise<MeetingSummary> {
        if(!this.client) throw new Error('OpenAI client not initialized');

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um assistente que gera atas de reunião estruturadas. Retorne APENAS JSON válido, sem markdown ou explicações.',
                },
                {
                    role: 'user',
                    content: `Analise a transcrição abaixo e gere um resumo estruturado com os seguintes campos:
- resumo: resumo executivo da reunião (string)
- participantes: nomes dos participantes (string[])
- decisoes: decisões tomadas durante a reunião (string[])
- actionItems: tarefas atribuídas, array de objetos { responsavel: string, tarefa: string, prazo?: string }
- proximosPassos: próximos passos definidos (string[])

Transcrição:
${transcript}`,
                },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if(!content) throw new Error('Empty response from OpenAI');

        const parsed = JSON.parse(content) as Partial<MeetingSummary>;
        return {
            resumo: parsed.resumo ?? '',
            participantes: parsed.participantes ?? [],
            decisoes: parsed.decisoes ?? [],
            actionItems: parsed.actionItems ?? [],
            proximosPassos: parsed.proximosPassos ?? [],
        };
    }
}
