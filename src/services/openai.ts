import OpenAI from "openai";

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

export class OpenAIService {
    private client: OpenAI | null = null;

    async initialize(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }

    async generateMeetingSummary(transcript: string): Promise<MeetingSummary> {
        if(!this.client) throw new Error('OpenAI client not initialized');
        const prompt = `Você é um assistente especializado em documentar reuniões.
        Analise a transcrição abaixo e gere um resumo estruturado em JSON com:
        - resumo: resumo executivo da reunião
        - participantes: lista de quem participou
        - decisoes: decisões tomadas durante a reunião
        - actionItems: array de objetos com {responsavel, tarefa, prazo}
        - proximosPassos: lista de próximos passos definidos na reunião
        
        Transcrição:
        ${transcript}
        
        Retorne APENAS o JSON, sem explicações adicionais.`;
        
        const response = await this.client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {role: 'system', content: 'Você é um assistente que gera atas de reunião estruturadas.'},
                {role: 'user', content: prompt},
            ],
            temperature: 0.3,
            response_format: {type: 'json_object'}
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || '{}');
    }

    async compareMeetings(transcriptAtual: string, transcriptAnterior: string): Promise<string> {
        if(!this.client) throw new Error('OpenAI client not initialized');
        const prompt = `Compare estas duas reuniões e identifique:
        1. O que mudou entre a reunião anterior e a atual.
        2. Decisões que foram alteradas.
        3. Novos action items que surgiram.
        4. Itens que foram resolvidos ou descartados.
        
        Reunião anterior:
        ${transcriptAnterior}
        
        Reunião atual:
        ${transcriptAtual}
        
        Seja específico nas mudanças e forneça um resumo claro. (ex: "A decisão X foi alterada para Y", "O action item Z foi resolvido")`;

        const response = await this.client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{role: 'user', content: prompt}],
            temperature: 0.3
        })
        return response.choices[0].message.content || '';
    }
}