import http from "@ohos:net.http";
import { AiConfig } from "@bundle:com.example.contractradar/entry/ets/config/AiConfig";
import { SAMPLE_ANALYSIS } from "@bundle:com.example.contractradar/entry/ets/data/SampleData";
import type { AnalysisResult, Clause, Contract, NegotiationScript, RiskItem } from '../model/Models';
interface ApiNegotiation {
    tone: string;
    text: string;
}
interface ApiRisk {
    clauseId: string;
    riskType: string;
    level: string;
    title: string;
    reason: string;
    consequence: string;
    suggestion: string;
    revisedClause: string;
    legalBasis: string[];
    negotiation: ApiNegotiation[];
}
interface ApiAnalysis {
    overallScore: number;
    summary: string;
    risks: ApiRisk[];
}
interface ChatMessage {
    role: string;
    content: string;
}
interface ResponseFormat {
    type: string;
}
interface ChatBody {
    model: string;
    messages: ChatMessage[];
    temperature: number;
    response_format: ResponseFormat;
}
function delay(ms: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
function nowText(): string {
    const date = new Date();
    const pad = (value: number): string => {
        if (value < 10) {
            return '0' + value.toString();
        }
        return value.toString();
    };
    return date.getFullYear().toString() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
        ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}
function findClause(contract: Contract, clauseId: string): Clause | undefined {
    for (const clause of contract.clauses) {
        if (clause.id === clauseId) {
            return clause;
        }
    }
    return undefined;
}
function normalizeLevel(level: string): string {
    if (level === 'high' || level === 'medium' || level === 'low') {
        return level;
    }
    return 'medium';
}
function levelImpact(level: string): number {
    if (level === 'high') {
        return 10;
    }
    if (level === 'medium') {
        return 6;
    }
    return 3;
}
export class AiService {
    static async analyze(contract: Contract): Promise<AnalysisResult> {
        if (AiConfig.USE_MOCK || AiConfig.API_KEY.length === 0) {
            await delay(900);
            return SAMPLE_ANALYSIS;
        }
        try {
            return await AiService.analyzeWithApi(contract);
        }
        catch (error) {
            // 网络或模型异常时回退到内置分析结果，保证演示可继续。
            await delay(600);
            return SAMPLE_ANALYSIS;
        }
    }
    private static async analyzeWithApi(contract: Contract): Promise<AnalysisResult> {
        const httpRequest = http.createHttp();
        try {
            let contractText: string = '';
            for (const clause of contract.clauses) {
                contractText = contractText + clause.title + '\n' + clause.text + '\n\n';
            }
            const systemPrompt: string = '你是租房合同风险审查助手。请从承租人角度分析合同条款，识别押金、租金、违约金、维修责任、转租、提前解约、免责、争议管辖等风险。' +
                '只输出 JSON，不要输出 Markdown。JSON 结构：' +
                '{"overallScore":0-100,"summary":"一句话结论","risks":[{"clauseId":"c5","riskType":"押金与租金","level":"high|medium|low","title":"风险标题","reason":"风险原因","consequence":"可能后果","suggestion":"修改建议","revisedClause":"修改后的条款","legalBasis":["law585"],"negotiation":[{"tone":"温和","text":"谈判话术"}]}]}';
            const userPrompt: string = '请分析以下租房合同，并严格按 JSON 输出。\n\n合同名称：' + contract.name + '\n\n' + contractText +
                '\n可选法条 id：law496、law497、law506、law509、law543、law577、law585、law710、law712、law713、law716、law733、law734、lawCPL35。';
            const body: ChatBody = {
                model: AiConfig.MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            };
            const options: http.HttpRequestOptions = {
                method: http.RequestMethod.POST,
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + AiConfig.API_KEY
                },
                extraData: JSON.stringify(body),
                expectDataType: http.HttpDataType.STRING,
                connectTimeout: 30000,
                readTimeout: 60000
            };
            const response = await httpRequest.request(AiConfig.BASE_URL, options);
            if (response.responseCode !== 200) {
                throw new Error('HTTP ' + response.responseCode.toString());
            }
            const text: string = response.result as string;
            const parsed: ApiAnalysis = JSON.parse(text) as ApiAnalysis;
            if (parsed.risks === undefined || parsed.risks.length === 0) {
                throw new Error('empty risks');
            }
            const risks: RiskItem[] = [];
            let highCount: number = 0;
            let mediumCount: number = 0;
            let lowCount: number = 0;
            for (const apiRisk of parsed.risks) {
                const clauseId: string = apiRisk.clauseId !== undefined ? apiRisk.clauseId : '';
                const clause = findClause(contract, clauseId);
                const level: string = normalizeLevel(apiRisk.level);
                if (level === 'high') {
                    highCount++;
                }
                else if (level === 'medium') {
                    mediumCount++;
                }
                else {
                    lowCount++;
                }
                const negotiation: NegotiationScript[] = [];
                if (apiRisk.negotiation !== undefined) {
                    for (const item of apiRisk.negotiation) {
                        negotiation.push({ tone: item.tone, text: item.text });
                    }
                }
                const revised: string = apiRisk.revisedClause !== undefined ? apiRisk.revisedClause : '';
                const legalBasisIds: string[] = apiRisk.legalBasis !== undefined ? apiRisk.legalBasis : [];
                const risk: RiskItem = {
                    id: 'api_' + clauseId + '_' + risks.length.toString(),
                    clauseId: clauseId,
                    clauseTitle: clause !== undefined ? clause.title : '合同条款',
                    clauseText: clause !== undefined ? clause.text : '',
                    riskType: apiRisk.riskType !== undefined ? apiRisk.riskType : '其他',
                    level: level,
                    title: apiRisk.title !== undefined ? apiRisk.title : '合同风险',
                    reason: apiRisk.reason !== undefined ? apiRisk.reason : '',
                    consequence: apiRisk.consequence !== undefined ? apiRisk.consequence : '',
                    suggestion: apiRisk.suggestion !== undefined ? apiRisk.suggestion : '',
                    revisedClause: revised.length > 0 ? revised : (clause !== undefined ? clause.text : ''),
                    legalBasisIds: legalBasisIds,
                    negotiation: negotiation,
                    scoreImpact: levelImpact(level)
                };
                risks.push(risk);
            }
            if (risks.length === 0) {
                throw new Error('no valid risks');
            }
            let overallScore: number = parsed.overallScore;
            if (overallScore === undefined || overallScore < 0 || overallScore > 100) {
                overallScore = 70;
            }
            return {
                contractId: contract.id,
                contractName: contract.name,
                analyzedAt: nowText(),
                overallScore: overallScore,
                highCount: highCount,
                mediumCount: mediumCount,
                lowCount: lowCount,
                summary: parsed.summary !== undefined && parsed.summary.length > 0 ? parsed.summary : '合同存在若干风险条款，建议逐条核对。',
                categoryScores: SAMPLE_ANALYSIS.categoryScores,
                risks: risks
            };
        }
        finally {
            httpRequest.destroy();
        }
    }
}
